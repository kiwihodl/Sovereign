import { getNip05, createNip05, updateNip05, deleteNip05 } from '@/db/models/nip05Models';

export default async function handler(req, res) {
  const { slug } = req.query;
  const userId = slug;

  switch (req.method) {
    case 'GET':
      try {
        const nip05 = await getNip05(userId);
        if (nip05) {
          res.status(200).json(nip05);
        } else {
          res.status(404).json({ error: 'NIP-05 not found' });
        }
      } catch (error) {
        res.status(500).json({ error: 'Error fetching NIP-05' });
      }
      break;

    case 'POST':
      try {
        const { pubkey, name } = req.body;
        const nip05 = await createNip05(userId, pubkey, name.toLowerCase());
        res.status(201).json(nip05);
      } catch (error) {
        res.status(500).json({ error: 'Error creating NIP-05' });
      }
      break;

    case 'PUT':
      try {
        const { pubkey, name } = req.body;
        const nip05 = await updateNip05(userId, { pubkey, name: name.toLowerCase() });
        res.status(200).json(nip05);
      } catch (error) {
        res.status(500).json({ error: 'Error updating NIP-05' });
      }
      break;

    case 'DELETE':
      try {
        await deleteNip05(userId);
        res.status(204).end();
      } catch (error) {
        res.status(500).json({ error: 'Error deleting NIP-05' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
