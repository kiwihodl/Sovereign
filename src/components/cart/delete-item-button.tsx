'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useRouter } from 'next/router';

async function removeItem(lineId: string) {
  const res = await fetch('/api/cart', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ lineId: lineId }),
  });

  if (!res.ok) {
    alert('Error removing item from cart.');
  }
}

export function DeleteItemButton({ item }: { item: any }) {
  const router = useRouter();

  return (
    <button
      aria-label="Remove cart item"
      onClick={async (e: React.FormEvent<HTMLButtonElement>) => {
        e.preventDefault();
        await removeItem(item.id);
        router.refresh();
      }}
      className={clsx(
        'ease flex h-[17px] w-[17px] items-center justify-center rounded-full bg-neutral-500 transition-all duration-200'
      )}
    >
      <XMarkIcon className="hover:text-accent-3 mx-[1px] h-4 w-4 text-white dark:text-black" />
    </button>
  );
}
