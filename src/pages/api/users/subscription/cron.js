import {
  findExpiredSubscriptions,
  updateUserSubscription,
  expireUserSubscriptions,
} from '@/db/models/userModels';
import { webln } from '@getalby/sdk';
import { LightningAddress } from '@getalby/lightning-tools';

const lnAddress = process.env.LIGHTNING_ADDRESS;

// Calculate subscription amount based on type
const getAmount = (subscriptionType) => {
  // 500K for yearly (saves ~17% compared to monthly), 50K for monthly
  return subscriptionType === 'yearly' ? 500000 : 50000;
};

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Get all expired subscriptions (both monthly and yearly)
      // The findExpiredSubscriptions function handles different expiration periods:
      // - Monthly: 30 days + 1 hour
      // - Yearly: 365 days + 1 hour
      const expiredSubscriptions = await findExpiredSubscriptions();
      console.log(`Found ${expiredSubscriptions.length} expired subscriptions to process`);
      
      // Track stats for reporting
      const stats = {
        monthly: { processed: 0, renewed: 0, expired: 0 },
        yearly: { processed: 0, renewed: 0, expired: 0 },
      };
      
      const stillExpired = [];

      for (const { userId, nwc, subscriptionType = 'monthly' } of expiredSubscriptions) {
        // Track processed subscriptions by type
        stats[subscriptionType].processed++;
        
        if (nwc) {
          try {
            console.log(`Processing ${subscriptionType} subscription renewal for user ${userId}`);
            const amount = getAmount(subscriptionType);
            const nwcProvider = new webln.NostrWebLNProvider({
              nostrWalletConnectUrl: nwc,
            });
            await nwcProvider.enable();

            const ln = new LightningAddress(lnAddress);
            await ln.fetch();
            const newInvoice = await ln.requestInvoice({ 
              satoshi: amount,
              comment: `${subscriptionType ? (subscriptionType.charAt(0).toUpperCase() + subscriptionType.slice(1)) : 'Monthly'} Subscription Renewal for User: ${userId}`,
            });

            console.log(`Generated invoice for ${amount} sats for ${subscriptionType} subscription`);
            const response = await nwcProvider.sendPayment(newInvoice?.paymentRequest);

            if (response && response?.preimage) {
              console.log(`SUBSCRIPTION AUTO-RENEWED (${subscriptionType}) for User: ${userId}`);
              // Re-subscribe the user with the same subscription type
              await updateUserSubscription(userId, true, nwc, subscriptionType);
              // Track successful renewals
              stats[subscriptionType].renewed++;
              continue; // Skip adding to stillExpired list
            } else {
              console.log(`Payment failed for ${subscriptionType} subscription for user ${userId}: (stillExpired)`, response);
            }
          } catch (error) {
            console.error(`Payment failed for ${subscriptionType} subscription for user ${userId}:`, error);
          }
        } else {
          console.log(`No NWC found for user ${userId}, marking as expired`);
        }
        
        // Track failed renewals that will be expired
        stats[subscriptionType].expired++;
        stillExpired.push(userId);
      }

      // Expire all subscriptions that couldn't be renewed
      const expiredCount = await expireUserSubscriptions(stillExpired);

      console.log(`Processed ${expiredSubscriptions.length} total subscriptions (${stats.monthly.processed} monthly, ${stats.yearly.processed} yearly)`);
      console.log(`Renewed ${stats.monthly.renewed + stats.yearly.renewed} total subscriptions (${stats.monthly.renewed} monthly, ${stats.yearly.renewed} yearly)`);
      console.log(`Expired ${expiredCount} total subscriptions (${stats.monthly.expired} monthly, ${stats.yearly.expired} yearly)`);

      res.status(200).json({
        message: `Cron job completed successfully. 
                Processed ${expiredSubscriptions.length} subscriptions (${stats.monthly.processed} monthly, ${stats.yearly.processed} yearly). 
                Renewed ${stats.monthly.renewed + stats.yearly.renewed} subscriptions (${stats.monthly.renewed} monthly, ${stats.yearly.renewed} yearly).
                Expired ${expiredCount} subscriptions (${stats.monthly.expired} monthly, ${stats.yearly.expired} yearly).`,
        stats
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
