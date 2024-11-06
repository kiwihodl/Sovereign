import axios from "axios";
import crypto from "crypto";
import { verifyEvent } from 'nostr-tools/pure';
import appConfig from "@/config/appConfig";
import { runMiddleware, corsMiddleware } from "@/utils/corsMiddleware";
import { getLightningAddressByName } from "@/db/models/lightningAddressModels";

const BACKEND_URL = process.env.BACKEND_URL;
const PLEBDEVS_API_KEY = process.env.PLEBDEVS_API_KEY;

export default async function handler(req, res) {
    await runMiddleware(req, res, corsMiddleware);
    const { slug, ...queryParams } = req.query;

    let foundAddress = null;
    const customAddress = appConfig.customLightningAddresses.find(addr => addr.name === slug);

    if (customAddress) {
        foundAddress = customAddress;
    } else {
        foundAddress = await getLightningAddressByName(slug);
    }

    if (!foundAddress) {
        res.status(404).json({ error: 'Lightning address not found' });
        return;
    }

    if (foundAddress) {
        if (queryParams.amount) {
            const amount = parseInt(queryParams.amount);
            let metadata, metadataString, hash, descriptionHash;

            if (queryParams?.nostr) {
                // This is a zap request
                const zapRequest = JSON.parse(decodeURIComponent(queryParams.nostr));

                console.log("ZAP REQUEST", zapRequest)

                // Verify the zap request
                if (!verifyEvent(zapRequest)) {
                    res.status(400).json({ error: 'Invalid zap request' });
                    return;
                }

                // Validate zap request
                if (zapRequest.kind !== 9734) {
                    res.status(400).json({ error: 'Invalid zap request' });
                    return;
                }

                metadataString = JSON.stringify(zapRequest);
                hash = crypto.createHash('sha256').update(metadataString).digest('hex');
                descriptionHash = Buffer.from(hash, 'hex').toString('base64');
            } else {
                // This is a regular lnurl-pay request
                metadata = [
                    ["text/plain", `${foundAddress.name}'s LNURL endpoint, CHEERS!`]
                ];
                metadataString = JSON.stringify(metadata);
                hash = crypto.createHash('sha256').update(metadataString).digest('hex');
                descriptionHash = Buffer.from(hash, 'hex').toString('base64');
            }

            // Convert amount from millisatoshis to satoshis
            if (amount < (foundAddress.minSendable)) {
                res.status(400).json({ error: 'Amount too low' });
                return;
            } else if (amount > (foundAddress.maxSendable || Number.MAX_SAFE_INTEGER)) {
                res.status(400).json({ error: 'Amount too high' });
                return;
            } else {
                try {
                    const response = await axios.post(`${BACKEND_URL}/api/lightning-address/lnd`, { amount: amount, description_hash: descriptionHash, name: slug, zap_request: queryParams?.nostr ? queryParams.nostr : null }, {
                        headers: {
                            'Authorization': PLEBDEVS_API_KEY
                        }
                    });
                    res.status(200).json({ pr: response.data.invoice, verify: `${BACKEND_URL}/api/lightning-address/verify/${slug}/${response.data.payment_hash}` });
                } catch (error) {
                    console.error(error);
                    res.status(500).json({ error: 'Failed to generate invoice' });
                }
            }
        } else {
            res.status(400).json({ error: 'Amount not specified' });
        }
    } else {
        res.status(404).json({ error: 'Lightning address not found' });
    }
}