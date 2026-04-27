import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getSessionFromRequest } from "@/lib/server/auth";

const ADMIN_LOGIN_PATH = "/admin/login";

function isAdminRoute(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (!isAdminRoute(pathname)) {
    return NextResponse.next();
  }

  const session = getSessionFromRequest(request);
  const isLoginPage = pathname === ADMIN_LOGIN_PATH;

  if (!session && !isLoginPage) {
    const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (session && isLoginPage) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
