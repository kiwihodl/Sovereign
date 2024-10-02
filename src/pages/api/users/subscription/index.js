import { updateUserSubscription } from "@/db/models/userModels";
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/pages/api/auth/[...nextauth].js"

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

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