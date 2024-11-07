import axios from "axios";
import appConfig from "@/config/appConfig";
import { getLightningAddressByName } from "@/db/models/lightningAddressModels";
import { kv } from '@vercel/kv';

const PLEBDEVS_API_KEY = process.env.PLEBDEVS_API_KEY;
const BACKEND_URL = process.env.BACKEND_URL;

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
        const expiry = response.data.expiry;
        const paymentHash = Buffer.from(response.data.r_hash, 'base64');
        const paymentHashHex = paymentHash.toString('hex');

        // If this is a zap, store verification URL and zap request in Redis
        if (zap_request && foundAddress.allowsNostr) {
            const zapRequest = JSON.parse(zap_request);
            const verifyUrl = `${BACKEND_URL}/api/lightning-address/verify/${name}/${paymentHashHex}`;
            
            // Store in Redis with 24-hour expiration
            await kv.set(`invoice:${paymentHashHex}`, {
                verifyUrl,
                zapRequest,
                name,
                invoice,
                foundAddress,
                settled: false
            }, { ex: expiry || 86400 }); // expiry matches invoice expiry

            res.status(200).json({ 
                invoice, 
                payment_hash: paymentHashHex,
                verify_url: verifyUrl 
            });
            return;
        }

        // For non-zap requests, send response immediately
        res.status(200).json({ invoice, payment_hash: paymentHashHex });
    } catch (error) {
        console.error('Error (server) fetching data from LND:', error.message);
        res.status(500).json({ message: 'Error fetching data' });
    }
}