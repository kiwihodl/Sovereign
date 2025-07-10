import { getProduct } from '@/lib/shopify';
import { Product } from '@/lib/shopify/types';
import { ProductDescription } from '@/components/product/product-description';
import { Gallery } from '@/components/product/gallery';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

export default function ProductPage() {
  const router = useRouter();
  const { handle } = router.query;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (handle) {
      const fetchProduct = async () => {
        setLoading(true);
        const productData = await getProduct(handle as string);
        setProduct(productData);
        setLoading(false);
      };
      fetchProduct();
    }
  }, [handle]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!product) {
    return <div>Product not found.</div>;
  }

  return (
    <div style={{ backgroundColor: '#201c24', paddingTop: '50px' }}>
      <div className="mx-auto max-w-screen-2xl px-4">
        <div className="flex flex-col rounded-lg bg-transparent p-8 md:p-12 lg:flex-row lg:gap-8">
          <div className="h-full w-full basis-full lg:basis-4/6">
            <Gallery
              images={product.images.map(image => ({
                src: image.url,
                altText: image.altText,
              }))}
            />
          </div>
          <div className="basis-full lg:basis-2/6">
            <ProductDescription product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
