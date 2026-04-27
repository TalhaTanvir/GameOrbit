import "dotenv/config";
import { z } from "zod";

const booleanFromEnv = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return value;
}, z.boolean());

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  APP_URL: z.string().url(),
  API_PREFIX: z.string().startsWith("/").default("/api/v1"),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRES_IN: z.string().min(2),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_REFRESH_EXPIRES_IN: z.string().min(2),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(4).max(15).default(12),
  CORS_ORIGIN: z.string().default(""),
  COOKIE_DOMAIN: z.string().min(1).optional(),
  COOKIE_SECURE: booleanFromEnv.default(false),
  COOKIE_SAME_SITE: z.enum(["lax", "strict", "none"]).default("lax"),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  CLOUDINARY_FOLDER_BASE: z.string().trim().min(1).default("gameorbit"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const formattedErrors = parsedEnv.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("\n");

  throw new Error(`Invalid environment variables:\n${formattedErrors}`);
}

const rawEnv = parsedEnv.data;
const corsOrigins = rawEnv.CORS_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const env = {
  nodeEnv: rawEnv.NODE_ENV,
  isProduction: rawEnv.NODE_ENV === "production",
  port: rawEnv.PORT,
  appUrl: rawEnv.APP_URL,
  apiPrefix: rawEnv.API_PREFIX,
  databaseUrl: rawEnv.DATABASE_URL,
  jwt: {
    accessSecret: rawEnv.JWT_ACCESS_SECRET,
    accessExpiresIn: rawEnv.JWT_ACCESS_EXPIRES_IN,
    refreshSecret: rawEnv.JWT_REFRESH_SECRET,
    refreshExpiresIn: rawEnv.JWT_REFRESH_EXPIRES_IN,
  },
  bcryptSaltRounds: rawEnv.BCRYPT_SALT_ROUNDS,
  corsOrigins,
  cookie: {
    domain: rawEnv.COOKIE_DOMAIN,
    secure: rawEnv.COOKIE_SECURE,
    sameSite: rawEnv.COOKIE_SAME_SITE,
  },
  cloudinary: {
    cloudName: rawEnv.CLOUDINARY_CLOUD_NAME,
    apiKey: rawEnv.CLOUDINARY_API_KEY,
    apiSecret: rawEnv.CLOUDINARY_API_SECRET,
    folderBase: rawEnv.CLOUDINARY_FOLDER_BASE,
  },
  rateLimit: {
    windowMs: rawEnv.RATE_LIMIT_WINDOW_MS,
    max: rawEnv.RATE_LIMIT_MAX,
  },
} as const;

export type Env = typeof env;
