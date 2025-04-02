import { getNip05ByName } from '@/db/models/nip05Models';
import { runMiddleware, corsMiddleware } from '@/utils/corsMiddleware';

export default async function Nip05(req, res) {
  await runMiddleware(req, res, corsMiddleware);
  const name = req.query.name;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const nip05 = await getNip05ByName(name);

  if (!nip05) {
    return res.status(404).json({ error: 'NIP-05 not found' });
  }

  return res.status(200).json({
    names: {
      [nip05.name.toLowerCase()]: nip05.pubkey,
    },
  });
}
