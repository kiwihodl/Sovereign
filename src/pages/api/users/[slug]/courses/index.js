import { createOrUpdateUserCourse } from '@/db/models/userCourseModels';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth].js';

export default async function handler(req, res) {
  const { method } = req;
  const { slug, courseSlug } = req.query;
  const userId = slug;

  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  switch (method) {
    case 'POST':
      try {
        const userCourse = await createOrUpdateUserCourse(userId, courseSlug, req.body);
        res.status(201).json(userCourse);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
