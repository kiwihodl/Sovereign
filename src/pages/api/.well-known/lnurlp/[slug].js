import appConfig from "@/config/appConfig"
import { runMiddleware, corsMiddleware } from "@/utils/corsMiddleware";
import { getLightningAddressByName } from "@/db/models/lightningAddressModels";

const BACKEND_URL = process.env.BACKEND_URL
const ZAP_PUBKEY = process.env.ZAP_PUBKEY

export default async function handler(req, res) {
    // Run CORS middleware first
    await runMiddleware(req, res, corsMiddleware);
    
    const { slug } = req.query;

    if (!slug || slug === 'undefined') {
        res.status(404).json({ error: 'Not found' })
        return
    }

    let foundAddress = null;
    const customAddress = appConfig.customLightningAddresses.find(addr => addr.name === slug);

    if (customAddress) {
        foundAddress = customAddress;
    } else {
        foundAddress = await getLightningAddressByName(slug);
    }

    if (!foundAddress) {
        res.status(404).json({ error: 'Lightning address not found' })
        return
    }

    const metadata = [
        ["text/plain", `${foundAddress.description}`]
    ];

    res.status(200).json({
        callback: `${BACKEND_URL}/api/lightning-address/callback/${foundAddress.name}`,
        maxSendable: foundAddress.maxSendable || 10000000000,
        minSendable: foundAddress.minSendable || 1000,
        metadata: JSON.stringify(metadata),
        tag: 'payRequest',
        allowsNostr: true,
        nostrPubkey: ZAP_PUBKEY
    });
}
