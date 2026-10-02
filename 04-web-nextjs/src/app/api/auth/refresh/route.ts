import { NextResponse } from "next/server";

import { refreshAuth } from "@/features/auth/api/bridge";

export async function POST() {
  const pair = await refreshAuth();
  if (!pair) {
    return NextResponse.json({ code: "UNAUTHORIZED", message: "Сессия истекла" }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
