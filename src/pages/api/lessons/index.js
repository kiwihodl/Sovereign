import { getAllLessons, createLesson } from "@/db/models/lessonModels";

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const lessons = await getAllLessons();
      res.status(200).json(lessons);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const lesson = await createLesson(req.body);
      res.status(201).json(lesson);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}