import { createOrUpdateUserCourse } from "@/db/models/userCourseModels";

export default async function handler(req, res) {
  const { method } = req;
  const { slug, courseSlug } = req.query;
  const userId = slug;
  switch (method) {
    case "POST":
      try {
        const userCourse = await createOrUpdateUserCourse(userId, courseSlug, req.body);
        res.status(201).json(userCourse);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}