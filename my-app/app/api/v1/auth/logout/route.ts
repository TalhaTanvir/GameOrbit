import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getSessionCookieName, getSessionCookieOptions } from "@/lib/server/auth";

export async function POST() {
  const cookieStore = await cookies();

  cookieStore.set(getSessionCookieName(), "", {
    ...getSessionCookieOptions(),
    maxAge: 0,
    expires: new Date(0),
  });

  return NextResponse.json({
    success: true,
    message: "Logged out successfully.",
  });
}
