import { addToCart, createCart, getCart, removeFromCart, updateCart } from '@/lib/shopify';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const cartId = req.cookies.cartId;

    if (!cartId) {
      return res.status(200).json({ cart: null });
    }

    try {
      const cart = await getCart(cartId);
      return res.status(200).json({ cart });
    } catch (e) {
      console.error('Error fetching cart:', e);
      return res.status(500).json({ error: 'Error fetching cart' });
    }
  }

  if (req.method === 'POST') {
    let cartId = req.cookies.cartId;
    let cart;

    console.log('API - Initial cartId:', cartId);

    if (cartId) {
      cart = await getCart(cartId);
    }

    if (!cartId || !cart) {
      cart = await createCart();
      cartId = cart.id;
      console.log('API - Created new cart with ID:', cartId);
      res.setHeader('Set-Cookie', `cartId=${cartId}; Path=/; SameSite=Lax`);
    }

    const { merchandiseId } = req.body;
    if (!merchandiseId) {
      return res.status(400).json({ error: 'Missing merchandiseId' });
    }

    try {
      const newCart = await addToCart(cartId, [{ merchandiseId, quantity: 1 }]);
      if (req.body.checkout) {
        return res.status(200).json(newCart);
      }
      return res.status(200).json({ success: true, cart: newCart });
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
      const updatedCart = await removeFromCart(cartId, [lineId]);
      return res.status(200).json({ success: true, cart: updatedCart });
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
      const updatedCart = await updateCart(cartId, [{ id: lineId, merchandiseId, quantity }]);
      return res.status(200).json({ success: true, cart: updatedCart });
    } catch (e) {
      return res.status(500).json({ error: 'Error updating item quantity' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE', 'PUT']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
