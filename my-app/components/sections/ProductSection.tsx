"use client";

import { useEffect, useMemo, useState } from "react";
import { FiChevronDown, FiLoader } from "react-icons/fi";
import { toast } from "sonner";

import { apiClient, getApiErrorMessage } from "@/lib/http/api-client";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ProductCard from "@/components/sections/ProductCard";
import type { Product, ProductFilterCategory } from "@/types/product.types";

const INITIAL_VISIBLE = 6;
const LOAD_MORE_STEP = 6;

function parseProducts(payload: unknown): Product[] {
  const root = typeof payload === "object" && payload !== null ? (payload as Record<string, unknown>) : null;
  const data = typeof root?.data === "object" && root.data !== null ? (root.data as Record<string, unknown>) : null;
  const list = Array.isArray(data?.items) ? data.items : [];

  return list
    .map((item) => {
      const product = item as Product;

      if (!product?.id || !product?.title || !product?.price || !product?.image || !product?.category) {
        return null;
      }

      return product;
    })
    .filter((product): product is Product => product !== null);
}

export default function ProductSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<ProductFilterCategory>("All Games");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      try {
        setIsLoading(true);
        const response = await apiClient.get("/products");

        if (mounted) {
          setProducts(parseProducts(response.data));
        }
      } catch (error) {
        if (mounted) {
          toast.error(getApiErrorMessage(error, "Failed to load products."));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  const gameCategories = useMemo<ProductFilterCategory[]>(() => {
    const uniqueCategories = Array.from(new Set(products.map((product) => product.category)));
    return ["All Games", ...uniqueCategories];
  }, [products]);

  const effectiveSelectedCategory = gameCategories.includes(selectedCategory) ? selectedCategory : "All Games";

  const filteredProducts = useMemo(
    () =>
      effectiveSelectedCategory === "All Games"
        ? products
        : products.filter((product) => product.category === effectiveSelectedCategory),
    [products, effectiveSelectedCategory],
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
                {effectiveSelectedCategory}
                <FiChevronDown className="size-4 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {gameCategories.map((category) => (
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

        {isLoading ? (
          <div className="flex min-h-48 items-center justify-center rounded-lg border border-border bg-muted/20">
            <FiLoader className="size-5 animate-spin text-muted-foreground" aria-hidden="true" />
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
            No products available.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {!isLoading && hasMore ? (
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
