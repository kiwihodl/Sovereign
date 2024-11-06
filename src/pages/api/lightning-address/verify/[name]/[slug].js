import axios from "axios";
import { getLightningAddressByName } from "@/db/models/lightningAddressModels";
import appConfig from "@/config/appConfig";

export default async function handler(req, res) {
    try {
        const { name, slug } = req.query;

        // Find the lightning address
        let foundAddress = null;
        const customAddress = appConfig.customLightningAddresses.find(addr => addr.name === name);

        if (customAddress) {
            foundAddress = customAddress;
        } else {
            foundAddress = await getLightningAddressByName(name);
        }

        if (!foundAddress) {
            res.status(200).json({ 
                status: "ERROR",
                reason: "Lightning address not found"
            });
            return;
        }

        // Call LND to check payment status
        const response = await axios.get(
            `https://${foundAddress.lndHost}:${foundAddress.lndPort}/v1/invoice/${slug}`,
            {
                headers: {
                    'Grpc-Metadata-macaroon': foundAddress.invoiceMacaroon,
                }
            }
        );

        // According to LUD-21 spec, we should return:
        // - { status: "OK", settled: true, preimage: "123456...", pr: "lnbc10..." }
        // - { status: "OK", settled: false, preimage: null, pr: "lnbc10..." }
        // - { status: "ERROR", reason: "error message" }
        if (response.data) {
            res.status(200).json({
                status: "OK",
                settled: response.data.state === "SETTLED",
                preimage: response.data.r_preimage ? 
                    Buffer.from(response.data.r_preimage, 'base64').toString('hex') : 
                    null,
                pr: response.data.payment_request
            });
        } else {
            res.status(200).json({ 
                status: "ERROR",
                reason: "Invoice not found"
            });
        }

    } catch (error) {
        console.error('Error verifying payment:', error.message);
        res.status(200).json({ 
            status: "ERROR",
            reason: error.message || "Error verifying payment"
        });
    }
}
