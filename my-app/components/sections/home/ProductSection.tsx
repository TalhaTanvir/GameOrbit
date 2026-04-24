"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const PRODUCT_IMAGE = "/images/PS5-cd.jpg";
const GAME_CATEGORIES = ["All Games", "New Arrival", "Adventure", "Sports"] as const;

const TOTAL_PRODUCTS = 48;
const INITIAL_VISIBLE = 18;
const LOAD_MORE_STEP = 6;

export default function ProductSection() {
  const [selectedCategory, setSelectedCategory] = useState<(typeof GAME_CATEGORIES)[number]>("All Games");

  const products = useMemo(
    () =>
      Array.from({ length: TOTAL_PRODUCTS }, (_, idx) => {
        const productNumber = idx + 1;

        return {
          id: `ps5-${productNumber}`,
          name: `PlayStation 5 Bundle ${productNumber}`,
          subtitle: "Console + Controller Edition",
          price: `$${(399 + (idx % 8) * 20).toFixed(2)}`,
          image: PRODUCT_IMAGE,
        };
      }),
    [],
  );

  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  const visibleProducts = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;

  return (
    <section className="w-full py-12 sm:py-14 lg:py-16">
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">PlayStation 5 Games</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between sm:w-56">
                {selectedCategory}
                <ChevronDown className="size-4 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {GAME_CATEGORIES.map((category) => (
                <DropdownMenuItem key={category} onClick={() => setSelectedCategory(category)}>
                  {category}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
          {visibleProducts.map((product) => (
            <Card
              key={product.id}
              className="group overflow-hidden rounded-xl transition duration-200 hover:-translate-y-1 hover:border-[color:color-mix(in_srgb,var(--foreground)_28%,transparent)] hover:shadow-md"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-transparent">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                  className="object-cover transition duration-300 group-hover:scale-[1.03]"
                />
              </div>

              <CardContent className="p-3 sm:p-4">
                <CardTitle className="text-sm font-bold leading-snug sm:text-base">Lords and Fallen</CardTitle>
                <p className="mt-1 text-sm text-[color:color-mix(in_srgb,var(--foreground)_78%,transparent)]">
                  Console: PS5
                </p>
                <p className="mt-3 text-base font-extrabold sm:text-lg">{product.price}</p>
                <Button className="mt-3 w-full">Add to Cart</Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {hasMore ? (
          <div className="mt-10 flex justify-center">
            <Button
              onClick={() => setVisibleCount((current) => Math.min(current + LOAD_MORE_STEP, products.length))}
              className="rounded-full"
            >
              View More
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
