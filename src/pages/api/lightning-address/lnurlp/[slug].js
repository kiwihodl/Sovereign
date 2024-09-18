import appConfig from "@/config/appConfig"
import { runMiddleware, corsMiddleware } from "@/utils/corsMiddleware";

const BACKEND_URL = process.env.BACKEND_URL
const ZAP_PUBKEY = process.env.ZAP_PUBKEY

export default async function handler(req, res) {
    await runMiddleware(req, res, corsMiddleware);
    const { slug } = req.query

    if (!slug || slug === 'undefined') {
        res.status(404).json({ error: 'Not found' })
        return
    }

    const customAddress = appConfig.customLightningAddresses.find(addr => addr.name === slug)

    if (customAddress) {
        const metadata = [
            ["text/plain", `${customAddress.description}`]
        ];

        res.status(200).json({
            callback: `${BACKEND_URL}/api/lightning-address/callback/${customAddress.name}`,
            maxSendable: customAddress.maxSendable || 10000000000,
            minSendable: customAddress.minSendable || 1000,
            metadata: JSON.stringify(metadata),
            tag: 'payRequest',
            allowsNostr: true,
            nostrPubkey: ZAP_PUBKEY
        })
        return
    }

    res.status(404).json({ error: 'Lightning address not found' })
}