import { getDraftById, updateDraft, deleteDraft } from '@/db/models/draftModels';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export default async function handler(req, res) {
  const { slug } = req.query;

  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const draft = await getDraftById(slug);
      if (draft) {
        res.status(200).json(draft);
      } else {
        res.status(404).json({ error: 'Draft not found' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      const draft = await updateDraft(slug, req.body);
      if (draft) {
        res.status(200).json(draft);
      } else {
        res.status(400).json({ error: 'Draft not updated' });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      await deleteDraft(slug);
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
