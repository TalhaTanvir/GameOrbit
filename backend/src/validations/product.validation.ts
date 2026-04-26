import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().trim().min(2).max(140),
  description: z.string().trim().min(2).max(5000),
  price: z.number().nonnegative(),
  imageUrl: z.string().trim().url(),
  category: z.string().trim().min(1).max(80).optional().default("CDS"),
  stockQuantity: z.number().int().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export const updateProductSchema = createProductSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });
