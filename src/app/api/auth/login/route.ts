import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { getAdminPasswordHash } from "@/lib/admin-credentials";

const attempts = new Map<string, { count: number; resetAt: number }>();

function publicUrl(request: Request, path: string) {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
  const proto = request.headers.get("x-forwarded-proto") || (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return new URL(path, `${proto}://${host}`);
}

export async function POST(request: Request) {
  const form = await request.formData();
  const username = String(form.get("username") || "");
  const password = String(form.get("password") || "");
  const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0] || "local";
  const now = Date.now();
  const state = attempts.get(ip);
  if (state && state.resetAt > now && state.count >= 5) return NextResponse.redirect(publicUrl(request, "/dang-nhap-quan-tri?error=locked"), 303);
  const configuredUser = process.env.ADMIN_USER || "admin";
  const validUser = username === configuredUser;
  const passwordHash = validUser ? await getAdminPasswordHash(configuredUser) : "";
  const validPassword = validUser && await bcrypt.compare(password, passwordHash);
  if (!validUser || !validPassword) {
    const current = state && state.resetAt > now ? state : { count: 0, resetAt: now + 15 * 60_000 };
    current.count += 1;
    attempts.set(ip, current);
    return NextResponse.redirect(publicUrl(request, "/dang-nhap-quan-tri?error=invalid"), 303);
  }
  attempts.delete(ip);
  await createSession(username);
  return NextResponse.redirect(publicUrl(request, "/admin"), 303);
}
