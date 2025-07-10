'use client';

import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useRouter } from 'next/router';
import { useCart } from './cart-context';

export function EditItemQuantityButton({ item, type }: { item: any; type: 'plus' | 'minus' }) {
  const router = useRouter();
  const { refreshCart, dispatch } = useCart();

  async function handleUpdateQuantity() {
    const newQuantity = type === 'plus' ? item.quantity + 1 : item.quantity - 1;

    // Don't allow quantity to go below 1
    if (newQuantity < 1) {
      return;
    }

    const res = await fetch('/api/cart', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lineId: item.id,
        merchandiseId: item.merchandise.id,
        quantity: newQuantity,
      }),
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
      alert('Error updating item quantity.');
    }
  }

  return (
    <button
      aria-label={type === 'plus' ? 'Increase item quantity' : 'Decrease item quantity'}
      onClick={handleUpdateQuantity}
      className="ease flex h-6 w-6 flex-none items-center justify-center rounded-full transition-all duration-200 hover:bg-gray-600"
    >
      {type === 'plus' ? (
        <PlusIcon className="h-4 w-4 text-white" />
      ) : (
        <MinusIcon className="h-4 w-4 text-white" />
      )}
    </button>
  );
}
