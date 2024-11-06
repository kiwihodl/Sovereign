import axios from "axios";
import { finalizeEvent } from 'nostr-tools/pure';
import { SimplePool } from 'nostr-tools/pool';
import appConfig from "@/config/appConfig";
import { getLightningAddressByName } from "@/db/models/lightningAddressModels";

const ZAP_PRIVKEY = process.env.ZAP_PRIVKEY;
const PLEBDEVS_API_KEY = process.env.PLEBDEVS_API_KEY;

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
        const paymentHash = response.data.r_hash;

        // If this is a zap, publish a zap receipt
        if (zap_request && foundAddress.allowsNostr) {
            console.log("ZAP REQUEST", zap_request)
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

            const signedZapReceipt = finalizeEvent(zapReceipt, foundAddress.relayPrivkey || ZAP_PRIVKEY);

            // Publish zap receipt to relays
            const pool = new SimplePool();
            const relays = foundAddress.defaultRelays || appConfig.defaultRelayUrls || [];
            await Promise.any(pool.publish(relays, signedZapReceipt));
            console.log("ZAP RECEIPT PUBLISHED", signedZapReceipt);
        }

        res.status(200).json({ invoice, payment_hash: paymentHash });
    } catch (error) {
        console.error('Error (server) fetching data from LND:', error.message);
        res.status(500).json({ message: 'Error fetching data' });
    }
}