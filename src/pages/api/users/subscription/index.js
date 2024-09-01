import { updateUserSubscription } from "@/db/models/userModels";

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    try {
      const { userId, isSubscribed, nwc } = req.body;
      const updatedUser = await updateUserSubscription(userId, isSubscribed, nwc);

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}