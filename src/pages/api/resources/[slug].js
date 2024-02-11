import { getResourceById, updateResource, deleteResource } from "@/db/models/resourceModels";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const resource = await getResourceById(parseInt(id));
      if (resource) {
        res.status(200).json(resource);
      } else {
        res.status(404).json({ error: 'Resource not found' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      const resource = await updateResource(parseInt(id), req.body);
      res.status(200).json(resource);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      await deleteResource(parseInt(id));
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    // Handle any other HTTP method
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
