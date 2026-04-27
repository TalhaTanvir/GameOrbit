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
import { createProduct, listAllProducts } from "@/lib/server/store";

export async function GET(request: NextRequest) {
  const { response } = ensureAdmin(request);

  if (response) {
    return response;
  }

  const products = await listAllProducts();

  return NextResponse.json({
    success: true,
    data: {
      items: products,
    },
  });
}

export async function POST(request: NextRequest) {
  const { response } = ensureAdmin(request);

  if (response) {
    return response;
  }

  const formData = await request.formData();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const status = normalizeAdminStatus(String(formData.get("status") ?? "active"));
  const category = normalizeProductCategory(String(formData.get("category") ?? "New Arrival"));
  const price = parsePositivePrice(String(formData.get("price") ?? ""));

  if (!name || !description || price <= 0) {
    return jsonError("Please provide valid name, description, and price.");
  }

  try {
    const image = await parseFormImage(formData.get("image"));

    if (!image) {
      return jsonError("Product image is required.");
    }

    const product = await createProduct({
      name,
      image,
      price,
      description,
      status,
      category,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully.",
        data: {
          item: product,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Product could not be created.");
  }
}
