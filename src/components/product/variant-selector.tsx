'use client';

import { ProductOption, ProductVariant } from '@/lib/shopify/types';
import { createUrl } from '@/lib/shopify/utils';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type Combination = {
  id: string;
  availableForSale: boolean;
  [key: string]: string | boolean; // ie. { color: 'Red', size: 'Large', ... }
};

export function VariantSelector({
  options,
  variants,
}: {
  options: ProductOption[];
  variants: ProductVariant[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const combinations: Combination[] = variants.map(variant => ({
    id: variant.id,
    availableForSale: variant.availableForSale,
    ...variant.selectedOptions.reduce(
      (accumulator, option) => ({ ...accumulator, [option.name.toLowerCase()]: option.value }),
      {}
    ),
  }));

  return options.map(option => (
    <dl className="mb-8" key={option.id}>
      <dt className="mb-4 text-sm uppercase tracking-wide">{option.name}</dt>
      <dd className="flex flex-wrap gap-3">
        {option.values.map(value => {
          const optionNameLowerCase = option.name.toLowerCase();
          const optionSearchParams = new URLSearchParams(searchParams.toString());
          optionSearchParams.set(optionNameLowerCase, value);
          const optionUrl = createUrl(pathname, optionSearchParams);

          const isAvailable = combinations.find(
            combination =>
              combination[optionNameLowerCase] === value && combination.availableForSale
          );

          const isActive = searchParams.get(optionNameLowerCase) === value;

          return (
            <button
              key={value}
              aria-disabled={!isAvailable}
              disabled={!isAvailable}
              onClick={() => {
                router.replace(optionUrl, { scroll: false });
              }}
              title={`${option.name} ${value}${!isAvailable ? ' (Out of Stock)' : ''}`}
              className={`flex min-w-[48px] items-center justify-center rounded-full border px-2 py-1 text-sm transition-all
                ${
                  isActive
                    ? 'border-transparent bg-[#FF9500] text-white'
                    : 'border-[#FF9500] bg-transparent text-[#FF9500]'
                }
                ${
                  isAvailable
                    ? 'cursor-pointer hover:bg-orange-600 hover:text-white'
                    : 'cursor-not-allowed opacity-50'
                }
              `}
            >
              {value}
            </button>
          );
        })}
      </dd>
    </dl>
  ));
}
