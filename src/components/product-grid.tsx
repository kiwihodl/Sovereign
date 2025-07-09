import { Product } from '@/lib/shopify/types';
import Link from 'next/link';
import Image from 'next/image';

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <ul className="grid grid-flow-row gap-4 px-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {children}
    </ul>
  );
}

function GridTile({ product }: { product: Product }) {
  return (
    <li className="aspect-square transition-opacity">
      <Link className="h-full w-full" href={`/store/product/${product.handle}`}>
        <div className="group flex h-full w-full items-center justify-center overflow-hidden rounded-lg bg-black">
          {product.featuredImage && (
            <Image
              className="relative h-full w-full object-contain transition duration-300 ease-in-out group-hover:scale-105"
              src={product.featuredImage.url}
              alt={product.title}
              width={500}
              height={500}
            />
          )}
        </div>
      </Link>
    </li>
  );
}

export default function ProductGrid({ products }: { products: Product[] }) {
  return (
    <Grid>
      {products.map(product => (
        <GridTile key={product.handle} product={product} />
      ))}
    </Grid>
  );
}
