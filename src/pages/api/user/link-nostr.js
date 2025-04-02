import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '@/db/prisma';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { nostrPubkey, userId } = req.body;

    // Update user with new Nostr pubkey
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        pubkey: nostrPubkey,
        privkey: null, // Remove privkey when linking to external Nostr account
      },
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error linking Nostr:', error);
    res.status(500).json({ error: 'Failed to link Nostr account' });
  }
}
