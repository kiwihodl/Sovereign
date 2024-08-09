import { getAllCourseDraftsByUserId, getCourseDraftById, updateCourseDraft, deleteCourseDraft } from "@/db/models/courseDraftModels";

export default async function handler(req, res) {
    const { slug } = req.query;
    console.log('slug:', slug);
    const userId = req.body?.userId || req.query?.userId;
    console.log('userId:', userId);

    if (req.method === 'GET') {
        if (slug && !userId) {
            try {
                const courseDraft = await getCourseDraftById(slug);
                if (courseDraft) {
                    res.status(200).json(courseDraft);
                } else {
                    res.status(404).json({ error: 'Course draft not found' });
                }
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        } else if (userId) {
            try {
                console.log('INHEEEERE:', userId);
                const courseDrafts = await getAllCourseDraftsByUserId(userId);
                res.status(200).json(courseDrafts);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        } else {
            res.status(400).json({ error: 'User ID is required' });
        }
    } else if (req.method === 'PUT') {
        if (!slug) {
            return res.status(400).json({ error: 'Slug is required to update a course draft' });
        }
        try {
            const updatedCourseDraft = await updateCourseDraft(slug, req.body);
            res.status(200).json(updatedCourseDraft);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    } else if (req.method === 'DELETE') {
        if (!slug) {
            return res.status(400).json({ error: 'Slug is required to delete a course draft' });
        }
        try {
            await deleteCourseDraft(slug);
            res.status(204).end();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } else {
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
