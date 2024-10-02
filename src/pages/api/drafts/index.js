import { createDraft } from "@/db/models/draftModels";
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/pages/api/auth/[...nextauth]"

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    try {
      const draft = await createDraft(req.body);
      if (draft) {
        res.status(201).json(draft);
      } else {
        res.status(400).json({ error: 'Draft not created' });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  } else {
    // Handle any other HTTP method
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
