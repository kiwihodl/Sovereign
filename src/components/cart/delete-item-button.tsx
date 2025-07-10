'use client';

import { TrashIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useRouter } from 'next/router';
import { useCart } from './cart-context';

export function DeleteItemButton({ item }: { item: any }) {
  const { refreshCart, dispatch } = useCart();

  async function handleRemoveItem() {
    const res = await fetch('/api/cart', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lineId: item.id }),
    });

    if (res.ok) {
      const responseData = await res.json();
      if (responseData.cart) {
        // Update cart state immediately with the returned cart data
        dispatch({ type: 'SET_CART', payload: responseData.cart });
      } else {
        // Fallback to refreshing cart
        refreshCart();
      }
    } else {
      alert('Error removing item from cart.');
    }
  }

  return (
    <button
      aria-label="Remove cart item"
      onClick={handleRemoveItem}
      className="ease flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 hover:bg-gray-700"
    >
      <TrashIcon className="h-5 w-5 text-[#FF9500]" />
    </button>
  );
}
