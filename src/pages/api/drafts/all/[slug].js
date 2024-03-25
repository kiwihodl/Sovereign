import { getAllDraftsByUserId } from "@/db/models/draftModels";

export default async function handler(req, res) {
const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const resource = await getAllDraftsByUserId(parseInt(id));
        if (resource) {
            res.status(200).json(resource);
        } else {
            res.status(404).json({ error: 'Resource not found' });
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
