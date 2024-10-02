import { createCourseDraft } from "@/db/models/courseDraftModels";
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/pages/api/auth/[...nextauth]"

export default async function handler(req, res) {
    const session = await getServerSession(req, res, authOptions)

    if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method === 'POST') {
        try {
            const courseDraft = await createCourseDraft(req.body);

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