import { nip04 } from 'nostr-tools';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!session || !session.user.role?.admin) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  const APP_PRIV_KEY = process.env.APP_PRIV_KEY;
  const APP_PUBLIC_KEY = process.env.APP_PUBLIC_KEY;

  if (!APP_PRIV_KEY || !APP_PUBLIC_KEY) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const encryptedContent = await nip04.encrypt(APP_PRIV_KEY, APP_PUBLIC_KEY, content);
    res.status(200).json({ encryptedContent });
  } catch (error) {
    console.error('Encryption error:', error);
    res.status(500).json({ error: 'Failed to encrypt content' });
  }
}
