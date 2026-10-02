import { NextResponse } from "next/server";

import { backendLogout, clearAuthCookies, getAccessToken } from "@/features/auth/api/bridge";

export async function POST() {
  const token = await getAccessToken();
  if (token) await backendLogout(token);
  await clearAuthCookies();
  return NextResponse.json({ ok: true });
}
