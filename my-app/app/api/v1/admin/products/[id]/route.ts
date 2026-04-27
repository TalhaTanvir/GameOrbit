import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  ensureAdmin,
  jsonError,
  normalizeAdminStatus,
  normalizeProductCategory,
  parseFormImage,
  parsePositivePrice,
} from "@/lib/server/api";
import { deleteProduct, getProductById, updateProduct } from "@/lib/server/store";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function parseProductId(rawId: string) {
  const parsed = Number.parseInt(rawId, 10);
  return Number.isFinite(parsed) ? parsed : NaN;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { response } = ensureAdmin(request);

  if (response) {
    return response;
  }

  const { id } = await context.params;
  const productId = parseProductId(id);

  if (!Number.isFinite(productId)) {
    return jsonError("Invalid product id.", 400);
  }

  const existingProduct = await getProductById(productId);

  if (!existingProduct) {
    return jsonError("Product not found.", 404);
  }

  const formData = await request.formData();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const status = normalizeAdminStatus(String(formData.get("status") ?? existingProduct.status));
  const category = normalizeProductCategory(String(formData.get("category") ?? existingProduct.category));
  const price = parsePositivePrice(String(formData.get("price") ?? existingProduct.price));

  if (!name || !description || price <= 0) {
    return jsonError("Please provide valid name, description, and price.");
  }

  try {
    const imageFromUpload = await parseFormImage(formData.get("image"));
    const image = imageFromUpload ?? existingProduct.image;

    const updatedProduct = await updateProduct(productId, {
      name,
      image,
      price,
      description,
      status,
      category,
    });

    if (!updatedProduct) {
      return jsonError("Product not found.", 404);
    }

    return NextResponse.json({
      success: true,
      message: "Product updated successfully.",
      data: {
        item: updatedProduct,
      },
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Product could not be updated.");
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { response } = ensureAdmin(request);

  if (response) {
    return response;
  }

  const { id } = await context.params;
  const productId = parseProductId(id);

  if (!Number.isFinite(productId)) {
    return jsonError("Invalid product id.", 400);
  }

  const isDeleted = await deleteProduct(productId);

  if (!isDeleted) {
    return jsonError("Product not found.", 404);
  }

  return NextResponse.json({
    success: true,
    message: "Product deleted successfully.",
  });
}
