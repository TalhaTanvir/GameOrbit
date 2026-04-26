import { z } from "zod";

export const adminSetupSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  password: z.string().min(8).max(72),
});

export const adminLoginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});
