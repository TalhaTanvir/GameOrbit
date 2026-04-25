"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/CartStore";
import type { Product } from "@/types/product.types";

type ProductSectionProps = {
  product: Product;
};

export default function ProductSection({ product }: ProductSectionProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const addToCart = useCartStore((state) => state.addToCart);

  const galleryImages = useMemo(() => Array.from({ length: 5 }, () => product.image), [product.image]);

  const numericPrice = Number(product.price.replace(/[^0-9.]/g, ""));
  const oldPrice = `$${(numericPrice + 15).toFixed(2)}`;
  const discount = Math.max(10, Math.round(((numericPrice + 15 - numericPrice) / (numericPrice + 15)) * 100));

  const handleAddToBag = () => {
    addToCart({
      id: product.id,
      name: product.title,
      price: Number.isNaN(numericPrice) ? 0 : numericPrice,
      image: product.image,
      details: `Platform: ${product.platform}`,
    });
    toast.success(`${product.title} added to cart`);
  };

  return (
    <section className="w-full pb-12 pt-8 sm:pt-10">
      <div className="mx-auto w-full max-w-6xl space-y-5 px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border bg-card p-3 sm:p-4">
          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="grid gap-3 sm:grid-cols-[66px_1fr]">
              <div className="order-2 flex gap-2 overflow-x-auto sm:order-1 sm:flex-col sm:overflow-visible">
                {galleryImages.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative h-14 min-w-14 overflow-hidden rounded-lg border transition ${
                      index === selectedImageIndex
                        ? "border-foreground/60 ring-2 ring-foreground/20"
                        : "border-foreground/20 hover:border-foreground/35"
                    }`}
                    aria-label={`View image ${index + 1}`}
                  >
                    <Image
                      src={image}
                      alt={`${product.title} preview ${index + 1}`}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>

              <div className="order-1 rounded-xl border bg-[color:color-mix(in_srgb,var(--muted)_70%,var(--background))] p-2 sm:order-2">
                <div className="relative aspect-square overflow-hidden rounded-lg">
                  <Image
                    src={galleryImages[selectedImageIndex]}
                    alt={product.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 56vw"
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <header className="space-y-1.5">
                <h1 className="text-2xl font-extrabold leading-tight text-foreground">{product.title} PS5 Game Disc</h1>
              </header>

              <div>
                <p className="text-4xl font-black leading-none text-foreground">{product.price}</p>
                <p className="mt-1 text-sm">
                  <span className="line-through text-foreground/40">{oldPrice}</span>
                  <span className="ml-2 font-semibold text-emerald-600">{discount}% off</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <Button className="h-11 w-full text-base font-bold transition-colors duration-200 hover:bg-primary/85">
                  Buy this Item
                </Button>
                <Button
                  variant="outline"
                  className="h-11 w-full border-2 border-foreground/40 text-base font-bold transition-colors duration-200 hover:border-foreground hover:bg-transparent"
                  onClick={handleAddToBag}
                >
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-4 sm:p-5">
          <h2 className="text-2xl font-extrabold">Product Details</h2>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-foreground/80 sm:text-base">
            {product.title} is a PS5 game disc crafted for players who want smooth gameplay, high-fidelity graphics, and
            cinematic storytelling. This physical CD edition includes full disc media, original case artwork, and
            compatibility with standard PlayStation 5 consoles.
          </p>

          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2 sm:text-base">
            <div className="flex gap-2">
              <dt className="font-semibold">Package Dimensions:</dt>
              <dd>17.1 x 13.5 x 1.5 cm</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold">Genre:</dt>
              <dd>{product.category}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold">Platform:</dt>
              <dd>{product.platform}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold">Disc Type:</dt>
              <dd>Blu-ray PS5 CD</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold">Region:</dt>
              <dd>Region Free</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold">Release Batch:</dt>
              <dd>2026 Stock</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}

