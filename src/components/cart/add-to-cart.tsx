'use client';

import { PlusIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import { useCart } from './cart-context';
import Cookies from 'js-cookie';

export function AddToCart({
  variants,
  availableForSale,
}: {
  variants: any[];
  availableForSale: boolean;
}) {
  const router = useRouter();
  const { refreshCart, dispatch } = useCart();
  const defaultVariantId = variants.length ? variants[0].id : undefined;

  async function handleAddToCart() {
    if (!defaultVariantId) return;

    const cartId = Cookies.get('cartId');

    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ merchandiseId: defaultVariantId, cartId }),
    });

    if (res.ok) {
      // Get the updated cart data from the response
      const responseData = await res.json();

      if (responseData.cart) {
        // Update cart state immediately with the returned cart data
        dispatch({ type: 'SET_CART', payload: responseData.cart });
      } else {
        alert('Error adding item to cart.');
      }
    } else {
      console.error('Error adding item to cart');
      alert('Error adding item to cart.');
    }
  }

  if (!availableForSale) {
    return (
      <button
        aria-disabled
        className="w-full bg-gray-500 text-white py-2 px-4 rounded-md cursor-not-allowed"
      >
        Out Of Stock
      </button>
    );
  }

  return (
    <button
      onClick={handleAddToCart}
      type="button"
      className="w-full bg-[#FF9500] text-black py-2 px-4 rounded-md hover:opacity-90 flex items-center justify-center"
    >
      <PlusIcon className="h-5 w-5 mr-2" />
      Add To Cart
    </button>
  );
}
