import { NextResponse, type NextRequest } from "next/server";

// Имя дублируем строкой намеренно: middleware крутится в edge-runtime,
// импортировать server-only мост сюда нельзя. Источник правды — ACCESS_COOKIE в features/auth/api/bridge.
const ACCESS_COOKIE = "access_token";

export default function proxy(request: NextRequest) {
  if (request.cookies.has(ACCESS_COOKIE)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/";
  url.searchParams.set("auth", "required");
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/profile/:path*", "/orders/:path*", "/admin/:path*"],
};
