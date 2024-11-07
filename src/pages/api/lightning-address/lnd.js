import axios from "axios";
import { finalizeEvent } from 'nostr-tools/pure';
import { SimplePool } from 'nostr-tools/pool';
import appConfig from "@/config/appConfig";
import { getLightningAddressByName } from "@/db/models/lightningAddressModels";

const ZAP_PRIVKEY = process.env.ZAP_PRIVKEY;
const PLEBDEVS_API_KEY = process.env.PLEBDEVS_API_KEY;
const BACKEND_URL = process.env.BACKEND_URL;

async function pollPaymentStatus(baseUrl, name, paymentHash, maxAttempts = 300, interval = 1000) {
    for (let i = 0; i < maxAttempts; i++) {
        console.log(`Polling payment status for ${name}... (${i}/${maxAttempts})`);
        try {
            const response = await axios.get(`${baseUrl}/api/lightning-address/verify/${name}/${paymentHash}`);
            
            if (response.data.status === "OK" && response.data.settled) {
                return true;
            }
            
            await new Promise(resolve => setTimeout(resolve, interval));
        } catch (error) {
            console.error('Error polling payment status:', error.message);
        }
    }
    return false;
}

export default async function handler(req, res) {
    // make sure api key is in authorization header
    const apiKey = req.headers['authorization'];
    if (!apiKey || apiKey !== PLEBDEVS_API_KEY) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    try {
        const { amount, description_hash, zap_request=null, name } = req.body;

        // Find the custom lightning address
        let foundAddress = null;
        const customAddress = appConfig.customLightningAddresses.find(addr => addr.name === name);

        if (customAddress) {
            foundAddress = customAddress;
        } else {
            foundAddress = await getLightningAddressByName(name);
        }

        if (!foundAddress) {
            res.status(404).json({ error: 'Lightning address not found' });
            return;
        }

        // Check if amount is within allowed range
        const minSendable = foundAddress.minSendable || appConfig.defaultMinSendable || 1;
        const maxSendable = foundAddress.maxSendable || appConfig.defaultMaxSendable || Number.MAX_SAFE_INTEGER;

        if (amount < minSendable || amount > maxSendable) {
            res.status(400).json({ error: 'Amount out of allowed range' });
            return;
        }

        // Check if the custom address allows zaps
        if (zap_request && !foundAddress.allowsNostr) {
            res.status(400).json({ error: 'Nostr zaps not allowed for this address' });
            return;
        }

        const response = await axios.post(`https://${foundAddress.lndHost}:${foundAddress.lndPort}/v1/invoices`, {
            value_msat: amount,
            description_hash: description_hash
        }, {
            headers: {
                'Grpc-Metadata-macaroon': foundAddress.invoiceMacaroon,
            }
        });

        const invoice = response.data.payment_request;
        const paymentHash = Buffer.from(response.data.r_hash, 'base64');
        const paymentHashHex = paymentHash.toString('hex');

        // If this is a zap, wait for payment and then publish a zap receipt
        if (zap_request && foundAddress.allowsNostr) {
            const zapRequest = JSON.parse(zap_request);
            const zapReceipt = {
                kind: 9735,
                created_at: Math.floor(Date.now() / 1000),
                content: foundAddress.zapMessage || appConfig.defaultZapMessage || '',
                tags: [
                    ['p', zapRequest.pubkey],
                    ['e', zapRequest.id],
                    ['bolt11', invoice],
                    ['description', JSON.stringify(zapRequest)]
                ]
            };

            // Start payment polling in the background
            const pollPromise = pollPaymentStatus(BACKEND_URL, name, paymentHashHex);

            // Send the response immediately
            res.status(200).json({ invoice, payment_hash: paymentHashHex });

            // Wait for payment to settle
            const isSettled = await pollPromise;
            console.log("Payment settled??", isSettled);

            if (isSettled) {
                const signedZapReceipt = finalizeEvent(zapReceipt, foundAddress.relayPrivkey || ZAP_PRIVKEY);

                // Publish zap receipt to relays
                const pool = new SimplePool();
                const relays = foundAddress.defaultRelays || appConfig.defaultRelayUrls || [];
                await Promise.any(pool.publish(relays, signedZapReceipt));
                console.log("ZAP RECEIPT PUBLISHED", signedZapReceipt);
            } else {
                console.log("Payment not settled after 60 seconds, skipping zap receipt");
            }
            return;
        }

        // For non-zap requests, send response immediately
        res.status(200).json({ invoice, payment_hash: paymentHashHex });
    } catch (error) {
        console.error('Error (server) fetching data from LND:', error.message);
        res.status(500).json({ message: 'Error fetching data' });
    }
}