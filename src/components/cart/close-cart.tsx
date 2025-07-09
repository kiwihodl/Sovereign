'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';
import { useCart } from './cart-context';

export function CloseCart() {
  const { dispatch } = useCart();

  return (
    <div className="relative flex h-11 w-11 items-center justify-center rounded-md border border-neutral-200 text-black transition-colors dark:border-neutral-700 dark:text-white">
      <button
        type="button"
        onClick={() => dispatch({ type: 'CLOSE_CART' })}
        className="relative flex h-11 w-11 items-center justify-center rounded-md border border-neutral-200 text-black transition-colors dark:border-neutral-700 dark:text-white"
      >
        <span className="sr-only">Close cart</span>
        <XMarkIcon className="h-6" />
      </button>
    </div>
  );
}
