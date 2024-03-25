import { createDraft } from "@/db/models/draftModels";

export default async function handler(req, res) {
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
