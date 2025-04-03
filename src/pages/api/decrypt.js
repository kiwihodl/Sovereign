import { nip04 } from 'nostr-tools';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { encryptedContent } = req.body;

  if (!encryptedContent) {
    return res.status(400).json({ error: 'Encrypted content is required' });
  }

  const APP_PRIV_KEY = process.env.APP_PRIV_KEY;
  const APP_PUBLIC_KEY = process.env.APP_PUBLIC_KEY;

  if (!APP_PRIV_KEY || !APP_PUBLIC_KEY) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const decryptedContent = await nip04.decrypt(APP_PRIV_KEY, APP_PUBLIC_KEY, encryptedContent);
    res.status(200).json({ decryptedContent });
  } catch (error) {
    console.error('Decryption error:', error);
    res.status(500).json({ error: 'Failed to decrypt content' });
  }
}
