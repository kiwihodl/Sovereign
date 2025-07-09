import { getProducts } from '@/lib/shopify';
import { Product } from '@/lib/shopify/types';
import ProductGrid from '@/components/product-grid'; // We will create this component next

export default function StorePage({ products }: { products: Product[] }) {
  return (
    <div style={{ backgroundColor: '#201c24' }}>
      <h1 className="text-2xl font-bold text-center my-8">Our Store</h1>
      <ProductGrid products={products} />
    </div>
  );
}

export async function getServerSideProps() {
  const products = await getProducts({});
  return {
    props: {
      products,
    },
  };
}
