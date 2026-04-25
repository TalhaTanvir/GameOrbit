"use client";

import Image from "next/image";
import Link from "next/link";
import { IoBagAddOutline } from "react-icons/io5";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useCartStore } from "@/store/CartStore";
import type { Product } from "@/types/product.types";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const addToCart = useCartStore((state) => state.addToCart);

  const handleAddToCart = () => {
    const numericPrice = Number(product.price.replace(/[^0-9.]/g, ""));

    addToCart({
      id: product.id,
      name: product.title,
      price: Number.isNaN(numericPrice) ? 0 : numericPrice,
      image: product.image,
      details: `Console: ${product.platform}`,
    });
    toast.success(`${product.title} added to cart`);
  };

  return (
    <Card className="group overflow-hidden rounded-xl transition duration-200 hover:-translate-y-1 hover:border-[color:color-mix(in_srgb,var(--foreground)_28%,transparent)] hover:shadow-md">
      <div className="relative aspect-[3/4] overflow-hidden bg-transparent">
        <Image
          src={product.image}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
          className="object-cover transition duration-300 group-hover:scale-[1.03]"
        />
      </div>

      <CardContent className="px-2.5 pb-2.5 pt-1 sm:px-3 sm:pb-3 sm:pt-1.5">
        <CardTitle className="text-sm font-bold leading-tight sm:text-base">{product.title}</CardTitle>
        <p className="mt-0.5 text-xs text-[color:color-mix(in_srgb,var(--foreground)_78%,transparent)] sm:text-sm">
          Console: {product.platform}
        </p>
        <p className="mt-1.5 text-base font-extrabold sm:text-lg">{product.price}</p>
        <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
          <Button asChild className="w-full">
            <Link href={`/products/${product.id}`}>View Product</Link>
          </Button>
          <Button
            size="icon"
            aria-label={`Add ${product.title} to cart`}
            onClick={handleAddToCart}
            className="transition-transform duration-200 hover:-translate-y-0.5 hover:scale-105"
          >
            <IoBagAddOutline className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
