import { getUserById, updateUser, deleteUser } from "@/db/models/userModels";

export default async function handler(req, res) {
  const { slug } = req.query;

  if (req.method === 'GET') {
    try {
      const user = await getUserById(parseInt(slug));
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      const user = await updateUser(parseInt(slug), req.body);
      res.status(200).json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      await deleteUser(parseInt(slug));
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
