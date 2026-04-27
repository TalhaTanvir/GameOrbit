import { NextResponse } from "next/server";

import { listActiveProducts } from "@/lib/server/store";

function formatPrice(price: number) {
  return `$${price.toFixed(2)}`;
}

export async function GET() {
  const products = await listActiveProducts();

  return NextResponse.json({
    success: true,
    data: {
      items: products.map((product) => ({
        id: String(product.id),
        title: product.name,
        price: formatPrice(product.price),
        image: product.image,
        platform: product.platform,
        category: product.category,
        description: product.description,
      })),
    },
  });
}
