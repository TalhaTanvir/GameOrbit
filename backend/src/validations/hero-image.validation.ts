import { z } from "zod";

export const createHeroImageSchema = z.object({
  title: z.string().trim().min(2).max(120),
  imageUrl: z.string().trim().url(),
  altText: z.string().trim().min(2).max(180),
  isActive: z.boolean().optional().default(true),
  displayOrder: z.number().int().min(0).optional().default(0),
});

export const updateHeroImageSchema = createHeroImageSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });
