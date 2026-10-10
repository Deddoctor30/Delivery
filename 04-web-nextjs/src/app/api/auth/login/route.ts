import { NextResponse } from "next/server";

import { backendLogin, setAuthCookies } from "@/features/auth/api/bridge";
import { ApiError } from "@/shared/api/error";

export async function POST(request: Request) {
  let body: { email?: string; password?: string; mode?: "login" | "register" };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "Некорректный JSON" },
      { status: 400 },
    );
  }
  if (!body.email || !body.password) {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "Нужны email и password" },
      { status: 400 },
    );
  }

  try {
    const result = await backendLogin({
      email: body.email,
      password: body.password,
      mode: body.mode,
    });
    await setAuthCookies(result);
    return NextResponse.json({ user: result.user });
  } catch (e) {
    if (e instanceof ApiError) {
      return NextResponse.json({ code: e.code, message: e.message }, { status: e.status });
    }
    return NextResponse.json({ code: "INTERNAL", message: "Ошибка входа" }, { status: 500 });
  }
}
