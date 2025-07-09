'use server';

import { getCart, createCart, addToCart, removeFromCart, updateCart } from '@/lib/shopify';
import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';

export async function addItem(selectedVariantId: string | undefined) {
  let cartId = cookies().get('cartId')?.value;
  let cart;

  if (cartId) {
    cart = await getCart(cartId);
  }

  if (!cartId || !cart) {
    cart = await createCart();
    cartId = cart.id;
    cookies().set('cartId', cartId);
  }

  if (!selectedVariantId) {
    throw new Error('Missing product variant ID');
  }

  await addToCart(cartId, [{ merchandiseId: selectedVariantId, quantity: 1 }]);
  revalidateTag('cart');
}

export async function removeItem(lineId: string) {
  const cartId = cookies().get('cartId')?.value;

  if (!cartId) {
    throw new Error('Missing cartId');
  }

  await removeFromCart(cartId, [lineId]);
  revalidateTag('cart');
}

export async function updateItemQuantity(lineId: string, variantId: string, quantity: number) {
  const cartId = cookies().get('cartId')?.value;

  if (!cartId) {
    throw new Error('Missing cartId');
  }

  await updateCart(cartId, [
    {
      id: lineId,
      merchandiseId: variantId,
      quantity,
    },
  ]);
  revalidateTag('cart');
}
