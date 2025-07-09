import { getProduct } from '@/lib/shopify';
import { Product } from '@/lib/shopify/types';
import { ProductDescription } from '@/components/product/product-description'; // We will create this next
import { Gallery } from '@/components/product/gallery'; // And this

export default function ProductPage({ product }: { product: Product }) {
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

export async function getServerSideProps(context: any) {
  const { handle } = context.params;
  const product = await getProduct(handle);

  if (!product) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      product,
    },
  };
}
