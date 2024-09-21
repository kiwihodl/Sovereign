import { checkCourseCompletion } from "@/db/models/userCourseModels";

// todo somehow make it to where we can get lesson slug in this endpoint
export default async function handler(req, res) {
  const { method } = req;
  const { slug, courseSlug } = req.query;
  switch (method) {
    case "GET":
      try {
        const courseCompletion = await checkCourseCompletion(slug, courseSlug);
        if (courseCompletion) {
          res.status(200).json(courseCompletion);
        } else {
          res.status(204).end();
        }
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}