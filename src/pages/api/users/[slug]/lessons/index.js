import { getUserLessons, createOrUpdateUserLesson } from "@/db/models/userLessonModels";
import { getResourceById } from "@/db/models/resourceModels";

// todo somehow make it to where we can get lesson slug in this endpoint
export default async function handler(req, res) {
  const { method } = req;
  const { slug, courseId } = req.query;
  const userId = slug;
  switch (method) {
    case "GET":
      try {
        const userLessons = await getUserLessons(userId);
        res.status(200).json(userLessons);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
      break;

    case "POST":
      try {
        const { resourceId, ...data } = req.body;
        const resource = await getResourceById(resourceId);
        const lesson = resource?.lessons.find((lesson) => lesson.courseId === courseId);
        const lessonId = lesson?.id;
        const userLesson = await createOrUpdateUserLesson(userId, lessonId, data);
        res.status(201).json(userLesson);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}