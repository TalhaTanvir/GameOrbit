"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiLoader } from "react-icons/fi";
import { toast } from "sonner";

import { apiClient, getApiErrorMessage } from "@/lib/http/api-client";
import ProductSection from "@/components/product/ProductSection";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types/product.types";

type ProductDetailsLoaderProps = {
  slug: string;
};

function parseProduct(payload: unknown): Product | null {
  const root = typeof payload === "object" && payload !== null ? (payload as Record<string, unknown>) : null;
  const data = typeof root?.data === "object" && root.data !== null ? (root.data as Record<string, unknown>) : null;
  const item = typeof data?.item === "object" && data.item !== null ? (data.item as Product) : null;

  if (!item?.id || !item?.title || !item?.price || !item?.image || !item?.category) {
    return null;
  }

  return item;
}

export default function ProductDetailsLoader({ slug }: ProductDetailsLoaderProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadProduct() {
      try {
        setIsLoading(true);
        setNotFound(false);

        const response = await apiClient.get(`/products/${slug}`);

        if (!mounted) {
          return;
        }

        const parsedProduct = parseProduct(response.data);

        if (!parsedProduct) {
          setNotFound(true);
          return;
        }

        setProduct(parsedProduct);
      } catch (error) {
        if (!mounted) {
          return;
        }

        setNotFound(true);
        toast.error(getApiErrorMessage(error, "Failed to load product details."));
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void loadProduct();

    return () => {
      mounted = false;
    };
  }, [slug]);

  if (isLoading) {
    return (
      <section className="w-full py-12">
        <div className="mx-auto flex max-w-4xl items-center justify-center rounded-xl border border-border bg-muted/20 p-8">
          <FiLoader className="size-6 animate-spin text-muted-foreground" aria-hidden="true" />
        </div>
      </section>
    );
  }

  if (notFound || !product) {
    return (
      <section className="w-full py-12">
        <div className="mx-auto max-w-4xl rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
          <h1 className="text-2xl font-bold">Product Not Found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The product you are looking for does not exist or is no longer available.
          </p>
          <Button asChild className="mt-6">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </section>
    );
  }

  return <ProductSection product={product} />;
}
