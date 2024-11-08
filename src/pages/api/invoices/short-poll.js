import axios from "axios";

const PLEBDEVS_API_KEY = process.env.PLEBDEVS_API_KEY;
const BACKEND_URL = process.env.BACKEND_URL;

export default async function handler(req, res) {
    // Verify API key
    const apiKey = req.headers['authorization'];
    if (!apiKey || apiKey !== PLEBDEVS_API_KEY) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    try {
        // Poll for 120 seconds maximum
        const startTime = Date.now();
        const timeoutDuration = 30000; // 30 seconds in milliseconds

        while (Date.now() - startTime < timeoutDuration) {
            const pollResponse = await axios.get(`${BACKEND_URL}/api/invoices/polling`, {
                headers: {
                    'Authorization': PLEBDEVS_API_KEY
                }
            });

            console.log('Polling response', pollResponse.data);

            // If no pending invoices, we can stop polling
            if (pollResponse.data.pending === 0) {
                res.status(200).json({ success: true, settled: true });
                return;
            }

            // Wait 1 second before next poll
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // If we reach here, we timed out
        res.status(200).json({ success: true, settled: false });
    } catch (error) {
        console.error('Polling error:', error);
        res.status(500).json({ error: 'Polling failed' });
    }
}