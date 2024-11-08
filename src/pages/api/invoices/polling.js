import axios from "axios";
import { kv } from '@vercel/kv';
import { finalizeEvent } from 'nostr-tools/pure';
import { SimplePool } from 'nostr-tools/pool';
import appConfig from '@/config/appConfig';

const ZAP_PRIVKEY = process.env.ZAP_PRIVKEY;
const PLEBDEVS_API_KEY = process.env.PLEBDEVS_API_KEY;

export default async function handler(req, res) {
    // Verify API key
    const apiKey = req.headers['authorization'];
    if (!apiKey || apiKey !== PLEBDEVS_API_KEY) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    try {
        // Add execution time limit protection
        const startTime = Date.now();
        const TIMEOUT_MS = 8000; // Vercel timeout is 10s, give ourselves margin
        
        // Get all invoice keys from Redis
        const keys = await kv.keys('invoice:*');

        // Add batch size limit
        const BATCH_LIMIT = 500;
        if (keys.length > BATCH_LIMIT) {
            console.warn(`Large number of invoices: ${keys.length}. Processing first ${BATCH_LIMIT} only.`);
            keys.length = BATCH_LIMIT;
        }

        const results = {
            processed: 0,
            settled: 0,
            expired: 0,
            errors: 0,
            pending: 0
        };

        // Process each invoice
        for (const key of keys) {
            if (Date.now() - startTime > TIMEOUT_MS) {
                console.warn('Approaching timeout, stopping processing');
                break;
            }
            try {
                const invoiceData = await kv.get(key);
                if (!invoiceData) continue;

                const { name, foundAddress, zapRequest, settled } = invoiceData;
                const paymentHash = key.replace('invoice:', '');

                // Skip if already settled
                if (settled) {
                    await kv.del(key);
                    continue;
                }

                // Check payment status
                const response = await axios.get(
                    `https://${foundAddress.lndHost}:${foundAddress.lndPort}/v1/invoice/${paymentHash}`,
                    {
                        headers: {
                            'Grpc-Metadata-macaroon': foundAddress.invoiceMacaroon,
                        }
                    }
                );

                if (!response.data) {
                    results.errors++;
                    continue;
                }

                // Handle expired invoices
                if (response.data.state === "EXPIRED" || response.data.state === "CANCELED") {
                    await kv.del(key);
                    results.expired++;
                    continue;
                }

                // Handle pending invoices
                if (response.data.state === "OPEN") {
                    results.pending++;
                    continue;
                }

                // Handle settled invoices
                if (response.data.state === "SETTLED" && !settled) {
                    try {
                        const preimage = Buffer.from(response.data.r_preimage, 'base64').toString('hex');
                        
                        // Parse and prepare zap receipt
                        const parsedZapRequest = zapRequest;
                        const zapReceipt = {
                            kind: 9735,
                            created_at: Math.floor(Date.now() / 1000),
                            content: "",
                            tags: [
                                ["p", parsedZapRequest.tags.find(t => t[0] === "p")[1]],
                                ["bolt11", response.data.payment_request],
                                ["description", JSON.stringify(parsedZapRequest)],
                                ["preimage", preimage],
                            ]
                        };

                        const signedZapReceipt = finalizeEvent(zapReceipt, foundAddress.relayPrivkey || ZAP_PRIVKEY);
                        // Publish zap receipt to relays
                        const pool = new SimplePool();
                        const relays = foundAddress.defaultRelays || appConfig.defaultRelayUrls || [];
                        await Promise.any(pool.publish(relays, signedZapReceipt));

                        console.log(`Broadcasted zap receipt for ${name} (${paymentHash})`, zapReceipt);
                        
                        // Delete from Redis after successful broadcast
                        await kv.del(key);
                        results.settled++;
                    } catch (broadcastError) {
                        console.error('Error broadcasting zap receipt:', broadcastError);
                        // Keep in Redis for retry if broadcast fails
                        await kv.set(key, { ...invoiceData, settled: true }, { ex: 3600 });
                        results.errors++;
                    }
                }

                results.processed++;
            } catch (error) {
                console.error('Error processing invoice:', error);
                results.errors++;
            }
        }

        res.status(200).json(results);
    } catch (error) {
        console.error('Error in polling endpoint:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}