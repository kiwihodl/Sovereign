import { getAllResources, createResource } from '@/db/models/resourceModels';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const resources = await getAllResources();
      res.status(200).json(resources);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'POST') {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session?.user?.role?.admin) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const resource = await createResource(req.body);
      res.status(201).json(resource);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  } else {
    // Handle any other HTTP method
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
