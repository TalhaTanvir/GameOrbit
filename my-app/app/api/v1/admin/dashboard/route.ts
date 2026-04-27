import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { ensureAdmin } from "@/lib/server/api";
import { getDashboardStats } from "@/lib/server/store";

export async function GET(request: NextRequest) {
  const { response } = ensureAdmin(request);

  if (response) {
    return response;
  }

  const stats = await getDashboardStats();

  return NextResponse.json({
    success: true,
    data: stats,
  });
}
