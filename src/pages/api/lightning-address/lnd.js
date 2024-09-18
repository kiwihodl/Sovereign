import axios from "axios";
import { finalizeEvent } from 'nostr-tools/pure';
import { SimplePool } from 'nostr-tools/pool';
import appConfig from "@/config/appConfig";

const LND_HOST = process.env.LND_HOST;
const LND_MACAROON = process.env.LND_MACAROON;
const ZAP_PRIVKEY = process.env.ZAP_PRIVKEY;

export default async function handler(req, res) {
    try {
        const { amount, description_hash, zap_request=null, name } = req.body;

        // Find the custom lightning address
        const customAddress = appConfig.customLightningAddresses.find(addr => addr.name === name);

        if (!customAddress) {
            res.status(404).json({ error: 'Lightning address not found' });
            return;
        }

        // Check if amount is within allowed range
        const minSendable = customAddress.minSendable || appConfig.defaultMinSendable || 1;
        const maxSendable = customAddress.maxSendable || appConfig.defaultMaxSendable || Number.MAX_SAFE_INTEGER;

        if (amount < minSendable || amount > maxSendable) {
            res.status(400).json({ error: 'Amount out of allowed range' });
            return;
        }

        // Check if the custom address allows zaps
        if (zap_request && !customAddress.allowsNostr) {
            res.status(400).json({ error: 'Nostr zaps not allowed for this address' });
            return;
        }

        const response = await axios.post(`https://${LND_HOST}/v1/invoices`, {
            value_msat: amount,
            description_hash: description_hash
        }, {
            headers: {
                'Grpc-Metadata-macaroon': LND_MACAROON,
            }
        });

        const invoice = response.data.payment_request;

        // If this is a zap, publish a zap receipt
        if (zap_request && customAddress.allowsNostr) {
            console.log("ZAP REQUEST", zap_request)
            const zapRequest = JSON.parse(zap_request);
            const zapReceipt = {
                kind: 9735,
                created_at: Math.floor(Date.now() / 1000),
                content: customAddress.zapMessage || appConfig.defaultZapMessage || '',
                tags: [
                    ['p', zapRequest.pubkey],
                    ['e', zapRequest.id],
                    ['bolt11', invoice],
                    ['description', JSON.stringify(zapRequest)]
                ]
            };

            const signedZapReceipt = finalizeEvent(zapReceipt, customAddress.relayPrivkey || ZAP_PRIVKEY);

            // Publish zap receipt to relays
            const pool = new SimplePool();
            const relays = customAddress.defaultRelays || appConfig.defaultRelayUrls || [];
            await Promise.any(pool.publish(relays, signedZapReceipt));
        }

        res.status(200).json(invoice);
    } catch (error) {
        console.error('Error (server) fetching data from LND:', error.message);
        res.status(500).json({ message: 'Error fetching data' });
    }
}