import { z } from "zod";

const booleanFromFormValue = z.preprocess((value) => {
  if (typeof value === "string") {
    const normalizedValue = value.trim().toLowerCase();

    if (normalizedValue === "true") {
      return true;
    }

    if (normalizedValue === "false") {
      return false;
    }
  }

  return value;
}, z.boolean());

export const createProductSchema = z.object({
  name: z.string().trim().min(2).max(140),
  description: z.string().trim().min(2).max(5000),
  price: z.coerce.number().nonnegative(),
  category: z.string().trim().min(1).max(80).optional().default("CDS"),
  stockQuantity: z.coerce.number().int().min(0).optional().default(0),
  isActive: booleanFromFormValue.optional().default(true),
});

export const updateProductSchema = createProductSchema.partial();
