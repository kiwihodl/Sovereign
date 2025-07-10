'use client';

import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useCart } from './cart-context';

export default function OpenCart() {
  const { cart, dispatch } = useCart();
  const quantity = cart?.totalQuantity;

  console.log('OpenCart - cart:', cart);
  console.log('OpenCart - quantity:', quantity);

  return (
    <div
      className="relative flex h-11 w-11 items-center justify-center rounded-md text-white transition-colors"
      onClick={() => dispatch({ type: 'OPEN_CART' })}
    >
      <ShoppingCartIcon className="h-6 transition-all ease-in-out hover:scale-110" />

      {quantity ? (
        <div className="absolute right-1 top-1 h-4 w-4 rounded bg-[#FF9500] text-[11px] font-medium text-black flex items-center justify-center">
          {quantity}
        </div>
      ) : null}
    </div>
  );
}
