import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { jsonError } from "@/lib/server/api";
import {
  createSessionToken,
  getSessionCookieName,
  getSessionCookieOptions,
  getSessionExpirationDate,
  isValidAdminCredentials,
} from "@/lib/server/auth";

type LoginRequestBody = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  let body: LoginRequestBody;

  try {
    body = (await request.json()) as LoginRequestBody;
  } catch {
    return jsonError("Invalid request body.");
  }

  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";

  if (!email || !password) {
    return jsonError("Email and password are required.");
  }

  if (!isValidAdminCredentials(email, password)) {
    return jsonError("Invalid email or password.", 401);
  }

  const sessionToken = createSessionToken(email);
  const cookieStore = await cookies();

  cookieStore.set(getSessionCookieName(), sessionToken, {
    ...getSessionCookieOptions(),
    expires: getSessionExpirationDate(),
  });

  return NextResponse.json({
    success: true,
    message: "Logged in successfully.",
    data: {
      email,
      role: "admin",
    },
  });
}
