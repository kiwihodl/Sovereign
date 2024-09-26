import { getLightningAddress, createLightningAddress, updateLightningAddress, deleteLightningAddress } from "@/db/models/lightningAddressModels"

export default async function handler(req, res) {
  const { slug } = req.query;
  const userId = slug;

  switch (req.method) {
    case 'GET':
      try {
        const lightningAddress = await getLightningAddress(userId);
        if (lightningAddress) {
          res.status(200).json(lightningAddress);
        } else {
          res.status(404).json({ error: 'Lightning Address not found' });
        }
      } catch (error) {
        res.status(500).json({ error: 'Error fetching Lightning Address' });
      }
      break;

    case 'POST':
      try {
        const { name, description, maxSendable, minSendable, invoiceMacaroon, lndCert, lndHost, lndPort } = req.body;
        const lightningAddress = await createLightningAddress(userId, name, description, maxSendable, minSendable, invoiceMacaroon, lndCert, lndHost, lndPort);

        res.status(201).json(lightningAddress);
      } catch (error) {
        console.error('Error creating Lightning Address:', error);
        res.status(500).json({ error: 'Error creating Lightning Address', errorMessage: error.message });
      }
      break;

    case 'PUT':
      try {
        const data = req.body;
        const lightningAddress = await updateLightningAddress(userId, data);
        res.status(200).json(lightningAddress);
      } catch (error) {
        res.status(500).json({ error: 'Error updating Lightning Address' });
      }
      break;

    case 'DELETE':
      try {
        await deleteLightningAddress(userId);
        res.status(204).end();
      } catch (error) {
        res.status(500).json({ error: 'Error deleting Lightning Address' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}