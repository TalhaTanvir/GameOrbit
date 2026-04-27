import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

export type AdminSession = {
  email: string;
  role: "admin";
  exp: number;
};

const SESSION_COOKIE_NAME = "gameorbit_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 8;

function toBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function getSessionSecret() {
  const secret = process.env.AUTH_SESSION_SECRET?.trim();

  if (!secret) {
    return "missing-auth-session-secret";
  }

  return secret;
}

function signValue(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

export function getSessionCookieName() {
  return SESSION_COOKIE_NAME;
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  };
}

export function getSessionExpirationDate() {
  return new Date(Date.now() + SESSION_DURATION_SECONDS * 1000);
}

export function isValidAdminCredentials(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const expectedEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedEmail || !expectedPassword) {
    return false;
  }

  return normalizedEmail === expectedEmail && password === expectedPassword;
}

export function createSessionToken(email: string) {
  const payload: AdminSession = {
    email: email.trim().toLowerCase(),
    role: "admin",
    exp: Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS,
  };

  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = signValue(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function parseSessionToken(token: string | undefined | null): AdminSession | null {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signValue(encodedPayload);
  const providedSignatureBuffer = Buffer.from(signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);

  if (providedSignatureBuffer.length !== expectedSignatureBuffer.length) {
    return null;
  }

  if (!timingSafeEqual(providedSignatureBuffer, expectedSignatureBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload)) as AdminSession;

    if (!payload?.email || payload.role !== "admin" || typeof payload.exp !== "number") {
      return null;
    }

    if (payload.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function getSessionFromRequest(request: NextRequest) {
  const cookieValue = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  return parseSessionToken(cookieValue);
}
