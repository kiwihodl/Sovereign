import { addToCart, createCart, getCart, removeFromCart, updateCart } from '@/lib/shopify';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    let cartId = req.cookies.cartId;
    let cart;

    if (cartId) {
      cart = await getCart(cartId);
    }

    if (!cartId || !cart) {
      cart = await createCart();
      cartId = cart.id;
      res.setHeader('Set-Cookie', `cartId=${cartId}; HttpOnly; Path=/; SameSite=Lax`);
    }

    const { merchandiseId } = req.body;
    if (!merchandiseId) {
      return res.status(400).json({ error: 'Missing merchandiseId' });
    }

    try {
      await addToCart(cartId, [{ merchandiseId, quantity: 1 }]);
      return res.status(200).json({ success: true });
    } catch (e) {
      return res.status(500).json({ error: 'Error adding item to cart' });
    }
  }

  if (req.method === 'DELETE') {
    const cartId = req.cookies.cartId;
    const { lineId } = req.body;

    if (!cartId || !lineId) {
      return res.status(400).json({ error: 'Missing cartId or lineId' });
    }

    try {
      await removeFromCart(cartId, [lineId]);
      return res.status(200).json({ success: true });
    } catch (e) {
      return res.status(500).json({ error: 'Error removing item from cart' });
    }
  }

  if (req.method === 'PUT') {
    const cartId = req.cookies.cartId;
    const { lineId, merchandiseId, quantity } = req.body;

    if (!cartId || !lineId || !merchandiseId || typeof quantity === 'undefined') {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
      await updateCart(cartId, [{ id: lineId, merchandiseId, quantity }]);
      return res.status(200).json({ success: true });
    } catch (e) {
      return res.status(500).json({ error: 'Error updating item quantity' });
    }
  }

  res.setHeader('Allow', ['POST', 'DELETE', 'PUT']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
