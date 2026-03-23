import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

const MAINTENANCE_PATH = "/maintenance";

const isPublicFile = (pathname: string) =>
  pathname.startsWith("/_next") ||
  pathname.startsWith("/favicon") ||
  pathname.startsWith("/images") ||
  pathname.startsWith("/icons") ||
  pathname.startsWith("/public") ||
  pathname.endsWith(".png") ||
  pathname.endsWith(".jpg") ||
  pathname.endsWith(".jpeg") ||
  pathname.endsWith(".gif") ||
  pathname.endsWith(".svg") ||
  pathname.endsWith(".webp") ||
  pathname.endsWith(".ico") ||
  pathname.endsWith(".css") ||
  pathname.endsWith(".js") ||
  pathname.endsWith(".map") ||
  pathname.endsWith(".txt") ||
  pathname.endsWith(".lottie");

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname === MAINTENANCE_PATH ||
    pathname.startsWith("/api") ||
    isPublicFile(pathname)
  ) {
    return NextResponse.next();
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/settings`, {
      cache: "no-store",
    });
    const result = await response.json();
    const raw = result?.data?.maintenance_enabled;
    const enabled =
      raw === true || raw === 1 || raw === "1" || raw === "true";

    if (enabled) {
      const url = request.nextUrl.clone();
      url.pathname = MAINTENANCE_PATH;
      return NextResponse.redirect(url);
    }
  } catch {
    // Fail open: if settings are unreachable, do not block the storefront.
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
