import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Request, type Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.ts";
import { apiRateLimiter, errorHandler, notFoundHandler } from "./middleware/index.ts";
import rootRouter from "./routes/index.ts";

const app = express();
const apiPrefix = env.apiPrefix;

// Supports comma-separated values in CORS_ORIGIN, e.g. "http://localhost:3000,https://app.example.com"
const allowedOrigins = env.corsOrigins;
const corsOrigin = env.isProduction
  ? (allowedOrigins.length > 0 ? allowedOrigins : false)
  : true;

app.disable("x-powered-by");

app.use(helmet());
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(apiRateLimiter);

if (env.nodeEnv !== "test") {
  app.use(morgan(env.isProduction ? "combined" : "dev"));
}

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    service: "GameOrbit Backend",
    status: "ok",
  });
});

app.get("/favicon.ico", (_req: Request, res: Response) => {
  res.status(204).end();
});

app.get(
  `${apiPrefix}/health`,
  (_req: Request, res: Response) => {
    res.status(200).json({
      status: "ok",
      environment: env.nodeEnv,
      timestamp: new Date().toISOString(),
    });
  }
);

app.use(apiPrefix, rootRouter);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
