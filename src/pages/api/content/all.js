import { getAllContentIds } from '../../../db/models/genericModels';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const ids = await getAllContentIds();
      res.status(200).json(ids);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    // Handle any other HTTP method
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
