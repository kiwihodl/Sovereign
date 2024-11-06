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
            res.status(404).json({ error: 'Lightning address not found' });
            return;
        }

        console.log("FOUND ADDRESS", foundAddress);
        console.log("SLUG", slug);

        // Call LND to check payment status
        const response = await axios.get(
            `https://${foundAddress.lndHost}/v1/invoice/${slug}`,
            {
                headers: {
                    'Grpc-Metadata-macaroon': foundAddress.invoiceMacaroon,
                }
            }
        );

        // According to LNURL-pay spec, we should return { status: "OK" } if paid
        // or { status: "ERROR", reason: "error message" } if not paid or error
        if (response.data.state === 'SETTLED') {
            res.status(200).json({ status: "OK" });
        } else {
            res.status(200).json({ 
                status: "ERROR", 
                reason: "Invoice not paid" 
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
