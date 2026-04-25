import { notFound } from "next/navigation";
import ProductSection from "@/components/product/ProductSection";
import { PRODUCTS } from "@/data/products";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductsPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = PRODUCTS.find((item) => item.id === slug);

  if (!product) {
    notFound();
  }

  return <ProductSection product={product} />;
}
