import { getLessonById, updateLesson, deleteLesson } from "@/db/models/lessonModels";

export default async function handler(req, res) {
  const { slug } = req.query;

  if (req.method === 'GET') {
    try {
      const lesson = await getLessonById(slug);
      if (lesson) {
        res.status(200).json(lesson);
      } else {
        res.status(404).json({ error: 'Lesson not found' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      const lesson = await updateLesson(slug, req.body);
      res.status(200).json(lesson);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      await deleteLesson(slug);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}