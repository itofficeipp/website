import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { categories, normalizeCategory } from "@/lib/categories";

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (pathname === "/san-pham") {
    const category = searchParams.get("category");
    const keyword = searchParams.get("q");

    if (category && !keyword) {
      const normalized = normalizeCategory(category);
      const match = categories.find((c) => c.slug === normalized);

      if (match) {
        const url = request.nextUrl.clone();
        url.pathname = `/san-pham/danh-muc/${match.slug}`;
        url.search = "";
        return NextResponse.redirect(url, 301);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/san-pham",
};
