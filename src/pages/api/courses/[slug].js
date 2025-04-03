import { getCourseById, updateCourse, deleteCourse } from '@/db/models/courseModels';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export default async function handler(req, res) {
  const { slug } = req.query;

  const session = await getServerSession(req, res, authOptions);

  if (req.method === 'GET') {
    try {
      const course = await getCourseById(slug);
      if (course) {
        res.status(200).json(course);
      } else {
        res.status(404).json({ error: 'Course not found' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'PUT') {
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const course = await updateCourse(slug, req.body);
      res.status(200).json(course);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  } else if (req.method === 'DELETE') {
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      await deleteCourse(slug);
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
