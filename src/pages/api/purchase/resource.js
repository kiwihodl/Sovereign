import { addResourcePurchaseToUser } from "@/db/models/userModels";
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/pages/api/auth/[...nextauth]"

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    try {
      const { userId, resourceId, amountPaid } = req.body;

      const updatedUser = await addResourcePurchaseToUser(userId, {
        resourceId,
        amountPaid: parseInt(amountPaid, 10) // Ensure amountPaid is an integer
      });

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}