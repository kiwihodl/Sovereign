import { createCourseDraft } from "@/db/models/courseDraftModels";

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const { userId, title, summary, image, price, topics, draftLessons } = req.body;

            if (!userId) {
                return res.status(400).json({ error: 'userId is required' });
            }

            const courseDraft = await createCourseDraft({
                userId,
                title,
                summary,
                image,
                price,
                topics: [...new Set([...topics.map(topic => topic.trim().toLowerCase())])],
                draftLessons: draftLessons?.map((lesson, index) => ({
                    draftId: lesson.draftId,
                    resourceId: lesson.resourceId,
                    index
                })) || []
            });

            res.status(201).json(courseDraft);
        } catch (error) {
            console.error('Error creating course draft:', error);
            res.status(500).json({ error: 'Failed to create course draft', details: error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}