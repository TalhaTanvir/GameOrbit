import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import morgan from "morgan";
import { env } from "./config/env.ts";

type ErrorWithStatus = Error & {
  statusCode?: number;
};

const app = express();
const apiPrefix = env.apiPrefix;

// Supports comma-separated values in CORS_ORIGIN, e.g. "http://localhost:3000,https://app.example.com"
const allowedOrigins = env.corsOrigins;

app.disable("x-powered-by");

app.use(helmet());
app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize());

if (env.nodeEnv !== "test") {
  app.use(morgan(env.isProduction ? "combined" : "dev"));
}

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    service: "GameOrbit Backend",
    status: "ok",
  });
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

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use(
  (
    error: ErrorWithStatus,
    _req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    const statusCode = error.statusCode || 500;
    const isProduction = env.isProduction;

    res.status(statusCode).json({
      success: false,
      message: error.message || "Internal Server Error",
      ...(isProduction ? {} : { stack: error.stack }),
    });
  }
);

export default app;
