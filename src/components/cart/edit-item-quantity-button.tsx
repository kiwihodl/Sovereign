'use client';

import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useRouter } from 'next/router';

async function updateItemQuantity(lineId: string, merchandiseId: string, quantity: number) {
  const res = await fetch('/api/cart', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ lineId, merchandiseId, quantity }),
  });

  if (!res.ok) {
    alert('Error updating item quantity.');
  }
}

export function EditItemQuantityButton({ item, type }: { item: any; type: 'plus' | 'minus' }) {
  const router = useRouter();

  return (
    <button
      aria-label={type === 'plus' ? 'Increase item quantity' : 'Decrease item quantity'}
      onClick={async (e: React.FormEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const newQuantity = type === 'plus' ? item.quantity + 1 : item.quantity - 1;
        await updateItemQuantity(item.id, item.merchandise.id, newQuantity);
        router.refresh();
      }}
      className={clsx(
        'ease flex h-full min-w-[36px] max-w-[36px] flex-none items-center justify-center rounded-full px-2 transition-all duration-200 hover:border-neutral-800 hover:opacity-80',
        {
          'ml-auto': type === 'minus',
        }
      )}
    >
      {type === 'plus' ? (
        <PlusIcon className="h-4 w-4 dark:text-neutral-500" />
      ) : (
        <MinusIcon className="h-4 w-4 dark:text-neutral-500" />
      )}
    </button>
  );
}
