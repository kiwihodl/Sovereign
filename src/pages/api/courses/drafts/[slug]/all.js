import { getAllCourseDraftsByUserId } from "@/db/models/courseDraftModels";

export default async function handler(req, res) {
    // the slug here is user id to get all drafts for a given user
    const {slug} = req.query;
    if (req.method === 'GET') {
        if (slug) {
            try {
                const courseDrafts = await getAllCourseDraftsByUserId(slug);
                res.status(200).json(courseDrafts);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        } else {
            res.status(400).json({ error: 'User ID is required' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}