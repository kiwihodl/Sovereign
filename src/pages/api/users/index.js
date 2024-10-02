import { getAllUsers, createUser } from '@/db/models/userModels';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/pages/api/auth/[...nextauth].js"

// todo add recaptcha for additional security
export default async function handler(req, res) {
  // const session = await getServerSession(req, res, authOptions);
  if (req.method === 'POST') {
    try {
      const user = await createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  } else {
    // Handle any other HTTP method
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
