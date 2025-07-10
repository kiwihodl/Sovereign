'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';
import { useCart } from './cart-context';

export function CloseCart() {
  const { dispatch } = useCart();

  return (
    <div className="relative flex h-11 w-11 items-center justify-center rounded-md text-[#FF9500] transition-colors">
      <button
        type="button"
        onClick={() => dispatch({ type: 'CLOSE_CART' })}
        className="relative flex h-11 w-11 items-center justify-center rounded-md text-[#FF9500] transition-colors hover:bg-gray-700"
      >
        <span className="sr-only">Close cart</span>
        <XMarkIcon className="h-6" />
      </button>
    </div>
  );
}
