import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { jsonError } from "@/lib/server/api";
import { getSessionFromRequest } from "@/lib/server/auth";

export async function GET(request: NextRequest) {
  const session = getSessionFromRequest(request);

  if (!session) {
    return jsonError("Unauthorized.", 401);
  }

  return NextResponse.json({
    success: true,
    data: {
      email: session.email,
      role: session.role,
    },
  });
}
