import { getUserById, getUserByPubkey, getUserByEmail, updateUser, deleteUser } from "@/db/models/userModels";
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/pages/api/auth/[...nextauth].js"

export default async function handler(req, res) {
  const { slug } = req.query;
  // Determine if slug is a pubkey, ID, or email
  const isPubkey = /^[0-9a-fA-F]{64}$/.test(slug);
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(slug);

  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    let user;
    if (isPubkey) {
      // If slug is a pubkey
      user = await getUserByPubkey(slug);
    } else if (isEmail) {
      // todo
      // If slug is an email
      user = await getUserByEmail(slug);
    } else {
      // Assume slug is an ID
      const id = parseInt(slug);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid identifier" });
        return;
      }
      user = await getUserById(id);
    }

    if (!user) {
      res.status(204).end();
      return;
    }

    switch (req.method) {
      case 'GET':
        res.status(200).json(user);
        break;
      case 'PUT':
        if (!isPubkey) {
          // Update operation should be done with an ID, not a pubkey
          const updatedUser = await updateUser(slug, req.body);
          res.status(200).json(updatedUser);
        } else {
          // Handle attempt to update user with pubkey
          res.status(400).json({ error: "Cannot update user with pubkey. Use ID instead." });
        }
        break;
      case 'DELETE':
        if (!isPubkey) {
          // Delete operation should be done with an ID, not a pubkey
          await deleteUser(parseInt(slug));
          res.status(204).end();
        } else {
          // Handle attempt to delete user with pubkey
          res.status(400).json({ error: "Cannot delete user with pubkey. Use ID instead." });
        }
        break;
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}