import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "dongdu_admin";
const secret = () => new TextEncoder().encode(process.env.AUTH_SECRET || "change-this-secret");

export async function createSession(username: string) {
  const token = await new SignJWT({ username, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret());
  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.COOKIE_SECURE !== "false",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE_NAME);
}

export async function getSession() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    return (await jwtVerify(token, secret())).payload;
  } catch {
    return null;
  }
}

export function isAiAuthorized(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const expected = process.env.AI_API_KEY;
  return Boolean(expected && token && token === expected);
}
