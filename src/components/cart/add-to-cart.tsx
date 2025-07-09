'use client';

import { PlusIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';

async function addToCartAction(variantId: string) {
  const res = await fetch('/api/cart', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ merchandiseId: variantId }),
  });

  if (!res.ok) {
    alert('Error adding item to cart.');
  }
}

export function AddToCart({
  variants,
  availableForSale,
}: {
  variants: any[];
  availableForSale: boolean;
}) {
  const router = useRouter();
  const defaultVariantId = variants.length ? variants[0].id : undefined;

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

  if (!defaultVariantId) return null;

  return (
    <form
      action={async () => {
        await addToCartAction(defaultVariantId);
        router.refresh();
      }}
    >
      <button
        type="submit"
        className="w-full bg-[#FF9500] text-white py-2 px-4 rounded-md hover:opacity-90 flex items-center justify-center"
      >
        <PlusIcon className="h-5 w-5 mr-2" />
        Add To Cart
      </button>
    </form>
  );
}
