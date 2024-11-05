import { findExpiredSubscriptions, updateUserSubscription, expireUserSubscriptions } from "@/db/models/userModels";
import { webln } from "@getalby/sdk";
import { LightningAddress } from '@getalby/lightning-tools';

const lnAddress = process.env.LIGHTNING_ADDRESS;
const amount = 25; // Set the subscription amount in satoshis

export default async function handler(req, res) {
    if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method === 'GET') {
        try {
            const expiredSubscriptions = await findExpiredSubscriptions();
            console.log("expiredSubscriptions", expiredSubscriptions);
            const stillExpired = [];

            for (const { userId, nwc } of expiredSubscriptions) {
                if (nwc) {
                    try {
                        const nwcProvider = new webln.NostrWebLNProvider({
                            nostrWalletConnectUrl: nwc
                        });
                        await nwcProvider.enable();

                        const ln = new LightningAddress(lnAddress);
                        await ln.fetch();
                        const newInvoice = await ln.requestInvoice({ satoshi: amount });

                        const response = await nwcProvider.sendPayment(newInvoice?.paymentRequest);

                        if (response && response?.preimage) {
                            await updateUserSubscription(userId, true, nwc);
                            continue; // Skip adding to stillExpired list
                        } else {
                            console.log(`Payment failed for user ${userId}: (stillExpired)`, response);
                        }
                    } catch (error) {
                        console.error(`Payment failed for user ${userId}:`, error);
                    }
                }
                stillExpired.push(userId);
            }

            const expiredCount = await expireUserSubscriptions(stillExpired);

            res.status(200).json({ 
                message: `Cron job completed successfully. 
                Processed ${expiredSubscriptions.length} subscriptions. 
                Expired ${expiredCount} subscriptions.` 
            });
        } catch (error) {
            console.error('Cron job error:', error);
            res.status(500).json({ error: error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
