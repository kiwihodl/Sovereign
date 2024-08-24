import { getAllDraftLessons, createDraftLesson } from "@/db/models/draftLessonModels";

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const draftLessons = await getAllDraftLessons();
      res.status(200).json(draftLessons);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const draftLesson = await createDraftLesson(req.body);
      res.status(201).json(draftLesson);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}