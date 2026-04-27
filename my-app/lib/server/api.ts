import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import type { AdminProductStatus } from "@/types/admin-product.types";
import type { ProductCategory } from "@/types/product.types";
import { getSessionFromRequest } from "@/lib/server/auth";

const ALLOWED_IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif"]);
const MAX_IMAGE_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const VALID_CATEGORIES: ProductCategory[] = ["New Arrival", "Adventure", "Sports"];

export function jsonError(message: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status },
  );
}

export function ensureAdmin(request: NextRequest) {
  const session = getSessionFromRequest(request);

  if (!session) {
    return {
      session: null,
      response: jsonError("Unauthorized.", 401),
    };
  }

  return { session, response: null };
}

export function normalizeAdminStatus(value: string | null): AdminProductStatus {
  return value === "inactive" ? "inactive" : "active";
}

export function normalizeProductCategory(value: string | null): ProductCategory {
  return VALID_CATEGORIES.includes(value as ProductCategory) ? (value as ProductCategory) : "New Arrival";
}

export function parsePositivePrice(value: string | null) {
  if (!value) {
    return 0;
  }

  const parsed = Number.parseFloat(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function parseDisplayOrder(value: string | null) {
  if (!value) {
    return 0;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export function normalizeBoolean(value: string | null) {
  if (!value) {
    return false;
  }

  return value.toLowerCase() === "true";
}

export async function parseFormImage(file: FormDataEntryValue | null) {
  if (!file || typeof file === "string" || file.size <= 0) {
    return null;
  }

  if (!ALLOWED_IMAGE_MIME_TYPES.has(file.type)) {
    throw new Error("Invalid image type. Allowed: JPEG, PNG, WEBP, AVIF.");
  }

  if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
    throw new Error("Image size must be 5MB or less.");
  }

  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const base64 = fileBuffer.toString("base64");

  return `data:${file.type};base64,${base64}`;
}
