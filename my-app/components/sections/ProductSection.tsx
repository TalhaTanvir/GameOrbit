"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ProductCard from "@/components/sections/ProductCard";
import { GAME_CATEGORIES, PRODUCTS } from "@/data/products";
import type { ProductFilterCategory } from "@/types/product.types";

const INITIAL_VISIBLE = 6;
const LOAD_MORE_STEP = 6;

export default function ProductSection() {
  const [selectedCategory, setSelectedCategory] = useState<ProductFilterCategory>("All Games");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  const filteredProducts = useMemo(
    () =>
      selectedCategory === "All Games"
        ? PRODUCTS
        : PRODUCTS.filter((product) => product.category === selectedCategory),
    [selectedCategory],
  );

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

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
                <DropdownMenuItem
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setVisibleCount(INITIAL_VISIBLE);
                  }}
                >
                  {category}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {hasMore ? (
          <div className="mt-10 flex justify-center">
            <Button
              onClick={() => setVisibleCount((current) => Math.min(current + LOAD_MORE_STEP, filteredProducts.length))}
              className="h-11 rounded-md border border-primary/30 bg-primary px-7 text-sm font-bold text-primary-foreground transition-colors duration-200 hover:bg-primary/80"
            >
              View More
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
