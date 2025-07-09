import { Product } from '@/lib/shopify/types';
import Price from '@/components/price';
import { AddToCart } from '@/components/cart/add-to-cart';
import { VariantSelector } from './variant-selector';

export function ProductDescription({ product }: { product: Product }) {
  return (
    <>
      <div className="mb-6 flex flex-col border-b pb-6 dark:border-neutral-700">
        <h1 className="mb-2 text-5xl font-medium">{product.title}</h1>
        <div className="mr-auto w-auto rounded-full bg-[#FF9500] p-2 text-sm text-white">
          <Price
            amount={product.priceRange.maxVariantPrice.amount}
            currencyCode={product.priceRange.maxVariantPrice.currencyCode}
          />
        </div>
      </div>

      <VariantSelector options={product.options} variants={product.variants} />

      {product.descriptionHtml ? (
        <div
          className="prose dark:prose-invert text-white"
          dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
        />
      ) : null}

      <div style={{ marginTop: '20px' }}>
        <AddToCart variants={product.variants} availableForSale={product.availableForSale} />
      </div>
    </>
  );
}
