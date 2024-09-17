import { nip04 } from 'nostr-tools';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
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