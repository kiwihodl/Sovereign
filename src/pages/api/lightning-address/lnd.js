import axios from "axios";
import { finalizeEvent } from 'nostr-tools/pure';
import { SimplePool } from 'nostr-tools/pool';

const LND_HOST = process.env.LND_HOST;
const LND_MACAROON = process.env.LND_MACAROON;
const RELAY_PRIVKEY = process.env.RELAY_PRIVKEY;

export default async function handler(req, res) {
    try {
        const response = await axios.post(`https://${LND_HOST}/v1/invoices`, {
            value: req.body.amount,
            description_hash: req.body.description_hash
        }, {
            headers: {
                'Grpc-Metadata-macaroon': LND_MACAROON,
            }
        });

        const invoice = response.data.payment_request;

        // If this is a zap, publish a zap receipt
        if (req.body.zap_request) {
            const zapRequest = JSON.parse(req.body.zap_request);
            const zapReceipt = {
                kind: 9735,
                created_at: Math.floor(Date.now() / 1000),
                content: '',
                tags: [
                    ['p', zapRequest.pubkey],
                    ['e', zapRequest.id],
                    ['bolt11', invoice],
                    ['description', JSON.stringify(zapRequest)]
                ]
            };

            const signedZapReceipt = finalizeEvent(zapReceipt, RELAY_PRIVKEY);

            // Publish zap receipt to relays
            const pool = new SimplePool();
            const relays = zapRequest.tags.find(tag => tag[0] === 'relays')?.[1] || [];
            await pool.publish(relays, signedZapReceipt);
        }

        res.status(200).json(invoice);
    } catch (error) {
        console.error('Error (server) fetching data from LND:', error.message);
        res.status(500).json({ message: 'Error fetching data' });
    }
}