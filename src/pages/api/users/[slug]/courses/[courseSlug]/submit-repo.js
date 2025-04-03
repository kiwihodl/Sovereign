import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth].js';
import { submitCourseRepo } from '@/db/models/userCourseModels';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { courseSlug } = req.query;
  const { repoLink } = req.body;

  try {
    await submitCourseRepo(session.user.id, courseSlug, repoLink);
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to submit repo' });
  }
}
