import ProductDetailsLoader from "@/components/product/ProductDetailsLoader";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductsPage({ params }: ProductPageProps) {
  const { slug } = await params;
  return <ProductDetailsLoader slug={slug} />;
}
