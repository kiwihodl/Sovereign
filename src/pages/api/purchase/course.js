import { addCoursePurchaseToUser } from "@/db/models/userModels";

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { userId, courseId, amountPaid } = req.body;

      const updatedUser = await addCoursePurchaseToUser(userId, {
        courseId,
        amountPaid: parseInt(amountPaid, 10)
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