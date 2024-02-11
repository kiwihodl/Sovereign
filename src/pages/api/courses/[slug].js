import { getCourseById, updateCourse, deleteCourse } from "@/db/models/courseModels";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const course = await getCourseById(parseInt(id));
      if (course) {
        res.status(200).json(course);
      } else {
        res.status(404).json({ error: 'Course not found' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      const course = await updateCourse(parseInt(id), req.body);
      res.status(200).json(course);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      await deleteCourse(parseInt(id));
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
