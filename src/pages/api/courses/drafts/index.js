import { createCourseDraft } from "@/db/models/courseDraftModels";

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            if (!req.body || !req.body.userId) {
                return res.status(400).json({ error: 'User ID is required' });
            }
            
            const newCourseDraft = await createCourseDraft(req.body);
            res.status(201).json(newCourseDraft);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}