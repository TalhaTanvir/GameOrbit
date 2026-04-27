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

export const createHeroImageSchema = z.object({
  title: z.string().trim().min(2).max(120),
  altText: z.string().trim().min(2).max(180),
  isActive: booleanFromFormValue.optional().default(true),
  displayOrder: z.coerce.number().int().min(0).optional().default(0),
});

export const updateHeroImageSchema = createHeroImageSchema.partial();
