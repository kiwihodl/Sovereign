import { checkAndUpdateExpiredSubscriptions } from "@/db/models/userModels";

export default async function handler(req, res) {
    if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method === 'POST') {
        try {
            const updatedCount = await checkAndUpdateExpiredSubscriptions();
            res.status(200).json({ message: `Cron job completed successfully. Updated ${updatedCount} subscriptions.` });
        } catch (error) {
            console.error('Cron job error:', error);
            res.status(500).json({ error: error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
