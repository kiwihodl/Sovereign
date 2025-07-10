import { Product } from '@/lib/shopify/types';
import Price from '@/components/price';
import { AddToCart } from '@/components/cart/add-to-cart';
import { VariantSelector } from './variant-selector';
import Cookies from 'js-cookie';

export function ProductDescription({ product }: { product: Product }) {
  return (
    <>
      <div className="mb-6 flex flex-col border-b pb-6 dark:border-neutral-700">
        <h1 className="mb-2 text-5xl font-medium">{product.title}</h1>
        <div className="mr-auto w-auto rounded-full bg-[#FF9500] p-2 text-sm text-black">
          <Price
            amount={product.priceRange.maxVariantPrice.amount}
            currencyCode={product.priceRange.maxVariantPrice.currencyCode}
          />
        </div>
      </div>

      <VariantSelector
        options={product.options}
        variants={product.variants}
        images={product.images}
      />

      {product.descriptionHtml ? (
        <div
          className="prose dark:prose-invert text-white"
          dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
        />
      ) : null}

      <div style={{ marginTop: '20px' }}>
        <AddToCart variants={product.variants} availableForSale={product.availableForSale} />
      </div>
      <div style={{ marginTop: '10px' }}>
        <button
          onClick={async () => {
            const cart = await addToCartAndCheckout(product.variants[0].id);
            if (cart?.checkoutUrl) {
              window.location.href = cart.checkoutUrl;
            } else {
              alert('Error creating checkout.');
            }
          }}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 flex items-center justify-center"
        >
          Add and Checkout
        </button>
      </div>
    </>
  );
}

async function addToCartAndCheckout(variantId: string) {
  const cartId = Cookies.get('cartId');
  const res = await fetch('/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ merchandiseId: variantId, cartId, checkout: true }),
  });

  if (res.ok) {
    return await res.json();
  }
  return null;
}
