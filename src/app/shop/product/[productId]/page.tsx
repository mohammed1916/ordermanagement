import ProductDetails from '@/components/products/ProductDetails';
import mockProducts from '@/data/products';

export default function Page() {
  return <ProductDetails />;
}

// Required for static export of dynamic route
export function generateStaticParams() {
  return mockProducts.map((product) => ({
    productId: product.id,
  }));
}
