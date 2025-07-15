'use client';

import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useCart } from './cart-context';

export default function OpenCart() {
  const { cart, dispatch } = useCart();
  const quantity = cart?.totalQuantity;

  return (
    <div
      className="relative flex h-16 w-16 items-center justify-center rounded-md text-white transition-colors"
      onClick={() => dispatch({ type: 'OPEN_CART' })}
    >
      <ShoppingCartIcon className="h-9 transition-all ease-in-out hover:scale-110" />

      {quantity ? (
        <div className="absolute right-2 top-2 h-6 w-6 rounded bg-[#FF9500] text-[13px] font-medium text-black flex items-center justify-center">
          {quantity}
        </div>
      ) : null}
    </div>
  );
}
