'use client';

import { useState, useEffect } from 'react';
import { getProduct } from '@/lib/shopify';
import { Product } from '@/lib/shopify/types';
import { ProductDescription } from './product-description';
import Image from 'next/image';

export default function EmbeddedProduct({ handle }: { handle: string }) {
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      const fetchedProduct = await getProduct(handle);
      if (fetchedProduct) {
        setProduct(fetchedProduct);
      }
    };

    fetchProduct();
  }, [handle]);

  if (!product) {
    return <div>Loading product...</div>; // Or a skeleton loader
  }

  return (
    <div className="mx-auto my-8 max-w-md rounded-lg border border-neutral-200 bg-white p-4 shadow-lg dark:border-neutral-800 dark:bg-black">
      <div className="flex gap-4">
        <div className="h-24 w-24 flex-shrink-0">
          {product.featuredImage && (
            <Image src={product.featuredImage.url} alt={product.title} width={96} height={96} />
          )}
        </div>
        <div className="flex-grow">
          <ProductDescription product={product} />
        </div>
      </div>
    </div>
  );
}
