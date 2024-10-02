import { getUserLesson, createOrUpdateUserLesson, deleteUserLesson } from "@/db/models/userLessonModels";
import { getResourceById } from "@/db/models/resourceModels";
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/pages/api/auth/[...nextauth].js"

// todo somehow make it to where we can get lesson slug in this endpoint
export default async function handler(req, res) {
  const { method } = req;
  const { slug, resourceSlug, courseId } = req.query;

  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  switch (method) {
    case "GET":
      try {
        const resource = await getResourceById(resourceSlug);
        const lesson = resource?.lessons.find((lesson) => lesson.courseId === courseId);
        const lessonId = lesson?.id;
        const userLesson = await getUserLesson(slug, lessonId);
        if (userLesson) {
          res.status(200).json(userLesson);
        } else {
          res.status(204).end();
        }
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
      break;

    case "PUT":
      try {
        const data = req.body;
        const resource = await getResourceById(resourceSlug);
        const lesson = resource?.lessons.find((lesson) => lesson.courseId === courseId);
        const lessonId = lesson?.id;
        const updatedUserLesson = await createOrUpdateUserLesson(slug, lessonId, data);
        res.status(200).json(updatedUserLesson);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
      break;

    case "DELETE":
      try {
        const resource = await getResourceById(resourceSlug);
        const lesson = resource?.lessons.find((lesson) => lesson.courseId === courseId);
        const lessonId = lesson?.id;
        await deleteUserLesson(slug, lessonId);
        res.status(204).end();
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}