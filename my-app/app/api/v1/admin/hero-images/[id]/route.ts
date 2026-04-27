import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  ensureAdmin,
  jsonError,
  normalizeBoolean,
  parseDisplayOrder,
  parseFormImage,
} from "@/lib/server/api";
import { deleteHeroImage, getHeroImageById, updateHeroImage } from "@/lib/server/store";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { response } = ensureAdmin(request);

  if (response) {
    return response;
  }

  const { id } = await context.params;
  const existingHeroImage = await getHeroImageById(id);

  if (!existingHeroImage) {
    return jsonError("Hero image not found.", 404);
  }

  const formData = await request.formData();
  const title = String(formData.get("title") ?? existingHeroImage.title).trim();
  const altText = String(formData.get("altText") ?? existingHeroImage.altText).trim();
  const displayOrder = parseDisplayOrder(String(formData.get("displayOrder") ?? existingHeroImage.displayOrder));
  const isActive = normalizeBoolean(String(formData.get("isActive") ?? existingHeroImage.isActive));

  if (!title || !altText) {
    return jsonError("Title and alt text are required.");
  }

  try {
    const imageFromUpload = await parseFormImage(formData.get("image"));
    const imageUrl = imageFromUpload ?? existingHeroImage.imageUrl;

    const updatedHeroImage = await updateHeroImage(id, {
      imageUrl,
      title,
      altText,
      isActive,
      displayOrder,
    });

    if (!updatedHeroImage) {
      return jsonError("Hero image not found.", 404);
    }

    return NextResponse.json({
      success: true,
      message: "Hero image updated successfully.",
      data: {
        item: updatedHeroImage,
      },
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Hero image could not be updated.");
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { response } = ensureAdmin(request);

  if (response) {
    return response;
  }

  const { id } = await context.params;
  const isDeleted = await deleteHeroImage(id);

  if (!isDeleted) {
    return jsonError("Hero image not found.", 404);
  }

  return NextResponse.json({
    success: true,
    message: "Hero image deleted successfully.",
  });
}
