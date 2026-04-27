import { NextResponse } from "next/server";

import { jsonError } from "@/lib/server/api";
import { getProductById } from "@/lib/server/store";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

function formatPrice(price: number) {
  return `$${price.toFixed(2)}`;
}

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const productId = Number.parseInt(slug, 10);

  if (!Number.isFinite(productId)) {
    return jsonError("Product not found.", 404);
  }

  const product = await getProductById(productId);

  if (!product || product.status !== "active") {
    return jsonError("Product not found.", 404);
  }

  return NextResponse.json({
    success: true,
    data: {
      item: {
        id: String(product.id),
        title: product.name,
        price: formatPrice(product.price),
        image: product.image,
        platform: product.platform,
        category: product.category,
        description: product.description,
      },
    },
  });
}
