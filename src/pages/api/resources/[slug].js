import { getResourceById, updateResource, deleteResource, } from "@/db/models/resourceModels";
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/pages/api/auth/[...nextauth]"

export default async function handler(req, res) {
  const { slug } = req.query;

  const session = await getServerSession(req, res, authOptions)

  if (req.method === 'GET') {
    try {
      const resource = await getResourceById(slug);
      if (resource) {
        res.status(200).json(resource);
      } else {
        res.status(404).json({ error: 'Resource not found' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'PUT') {
    if (!session || !session?.user?.role?.admin) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const resource = await getResourceById(slug);

      if (!resource) {
        return res.status(404).json({ error: 'Resource not found' });
      }

      const updatedResource = await updateResource(slug, req.body);

      res.status(200).json(updatedResource);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  } else if (req.method === 'DELETE') {
    if (!session || !session?.user?.role?.admin) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        await deleteResource(slug);
        res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
