import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth";

const publicPageRoutes = new Set(["/login", "/signup"]);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthApiRoute = pathname.startsWith("/api/auth");
  const isProtectedApiRoute = pathname.startsWith("/api/");
  const isProtectedPageRoute =
    pathname === "/" ||
    pathname.startsWith("/ask") ||
    pathname.startsWith("/doubts") ||
    pathname.startsWith("/mentor");

  if (!isProtectedApiRoute && !isProtectedPageRoute && !publicPageRoutes.has(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    if (isProtectedApiRoute && !isAuthApiRoute) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    if (isProtectedPageRoute) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  try {
    const payload = await verifyAuthToken(token);
    const requestHeaders = new Headers(request.headers);

    requestHeaders.set("x-user-id", payload.sub ?? "");
    requestHeaders.set("x-user-email", payload.email);
    requestHeaders.set("x-user-name", payload.name);
    requestHeaders.set("x-user-role", payload.role);

    if (pathname.startsWith("/mentor") && payload.role !== "mentor") {
      return NextResponse.redirect(new URL("/ask", request.url));
    }

    if (publicPageRoutes.has(pathname)) {
      return NextResponse.redirect(new URL("/ask", request.url));
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch {
    if (isProtectedApiRoute && !isAuthApiRoute) {
      return NextResponse.json({ error: "Invalid or expired session." }, { status: 401 });
    }

    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
