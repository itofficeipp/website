import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";
export async function POST(request: Request) {
  await destroySession();
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
  const proto = request.headers.get("x-forwarded-proto") || (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return NextResponse.redirect(new URL("/dang-nhap-quan-tri", `${proto}://${host}`), 303);
}
