import { getResourceById, updateResource, deleteResource, isResourcePartOfAnyCourse, updateLessonInCourse } from "@/db/models/resourceModels";

export default async function handler(req, res) {
  const { slug } = req.query;

  if (req.method === 'GET') {
    try {
      const resource = await getResourceById(slug);
      if (resource) {
        res.status(200).json(resource);
      } else {
        res.status(404).json({ error: 'Resource not found' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      // Fetch the resource by ID to check if it's part of a course
      const resource = await getResourceById(slug);

      if (!resource) {
        return res.status(404).json({ error: 'Resource not found' });
      }

      // Check if the resource is part of a course
      const isPartOfAnyCourse = resource.courseId !== null;

      if (isPartOfAnyCourse) {
        // Update the specific lesson in the course
        await updateLessonInCourse(resource.courseId, slug, req.body);
      }

      // Update the resource
      const updatedResource = await updateResource(slug, req.body);

      res.status(200).json(updatedResource);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      const isPartOfAnyCourse = await isResourcePartOfAnyCourse(slug);
      if (isPartOfAnyCourse) {
        res.status(400).json({ error: 'Resource is part of one or more courses' });
      } else {
        await deleteResource(slug);
        res.status(204).end();
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
