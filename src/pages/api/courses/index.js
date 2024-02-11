import { getAllCourses, createCourse } from "@/db/models/courseModels";

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const courses = await getAllCourses();
      res.status(200).json(courses);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const course = await createCourse(req.body);
      res.status(201).json(course);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  } else {
    // Handle any other HTTP method
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
