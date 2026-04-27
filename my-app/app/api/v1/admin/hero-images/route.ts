import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  ensureAdmin,
  jsonError,
  normalizeBoolean,
  parseDisplayOrder,
  parseFormImage,
} from "@/lib/server/api";
import { createHeroImage, listHeroImages } from "@/lib/server/store";

export async function GET(request: NextRequest) {
  const { response } = ensureAdmin(request);

  if (response) {
    return response;
  }

  const heroImages = await listHeroImages();

  return NextResponse.json({
    success: true,
    data: {
      items: heroImages,
    },
  });
}

export async function POST(request: NextRequest) {
  const { response } = ensureAdmin(request);

  if (response) {
    return response;
  }

  const formData = await request.formData();
  const title = String(formData.get("title") ?? "").trim();
  const altText = String(formData.get("altText") ?? "").trim();
  const displayOrder = parseDisplayOrder(String(formData.get("displayOrder") ?? "0"));
  const isActive = normalizeBoolean(String(formData.get("isActive") ?? "true"));

  if (!title || !altText) {
    return jsonError("Title and alt text are required.");
  }

  try {
    const imageUrl = await parseFormImage(formData.get("image"));

    if (!imageUrl) {
      return jsonError("Hero image is required.");
    }

    const heroImage = await createHeroImage({
      imageUrl,
      title,
      altText,
      isActive,
      displayOrder,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Hero image created successfully.",
        data: {
          item: heroImage,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Hero image could not be created.");
  }
}
