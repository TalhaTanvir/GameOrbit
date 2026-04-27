import { NextResponse } from "next/server";

import { listActiveHeroImages } from "@/lib/server/store";

export async function GET() {
  const heroImages = await listActiveHeroImages();

  return NextResponse.json({
    success: true,
    data: {
      items: heroImages.map((heroImage) => ({
        id: heroImage.id,
        imageUrl: heroImage.imageUrl,
        title: heroImage.title,
        altText: heroImage.altText,
        isActive: heroImage.isActive,
        displayOrder: heroImage.displayOrder,
      })),
    },
  });
}
