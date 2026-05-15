import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import type { AuthUser, UserRole } from "@/types";

export const AUTH_COOKIE_NAME = "house_of_edtech_auth";

type AuthTokenPayload = {
  sub: string;
  email: string;
  name: string;
  role: UserRole;
  exp: number;
  iat: number;
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("Missing JWT_SECRET environment variable.");
  }

  return secret;
}

function base64UrlEncode(input: string | Uint8Array) {
  const bytes =
    typeof input === "string" ? new TextEncoder().encode(input) : input;
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (normalized.length % 4 || 4)) % 4);
  const binary = atob(`${normalized}${padding}`);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function signHmacSha256(message: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message),
  );

  return new Uint8Array(signature);
}

async function verifyHmacSha256(
  message: string,
  signature: string,
  secret: string,
) {
  const expectedSignature = base64UrlEncode(await signHmacSha256(message, secret));
  return expectedSignature === signature;
}

export async function signAuthToken(user: AuthUser) {
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const now = Math.floor(Date.now() / 1000);
  const payload = base64UrlEncode(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      iat: now,
      exp: now + 60 * 60 * 24 * 7,
    } satisfies AuthTokenPayload),
  );
  const unsignedToken = `${header}.${payload}`;
  const signature = base64UrlEncode(
    await signHmacSha256(unsignedToken, getJwtSecret()),
  );

  return `${unsignedToken}.${signature}`;
}

export async function verifyAuthToken(token: string) {
  const [header, payload, signature] = token.split(".");

  if (!header || !payload || !signature) {
    throw new Error("Invalid token.");
  }

  const isValid = await verifyHmacSha256(
    `${header}.${payload}`,
    signature,
    getJwtSecret(),
  );

  if (!isValid) {
    throw new Error("Invalid token signature.");
  }

  const parsedPayload = JSON.parse(base64UrlDecode(payload)) as AuthTokenPayload;

  if (!parsedPayload.exp || parsedPayload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Token expired.");
  }

  return parsedPayload;
}

export async function getCurrentUserFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = await verifyAuthToken(token);
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    } satisfies AuthUser;
  } catch {
    return null;
  }
}

export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export function getUserFromRequest(request: NextRequest): AuthUser | null {
  const userId = request.headers.get("x-user-id");
  const email = request.headers.get("x-user-email");
  const name = request.headers.get("x-user-name");
  const role = request.headers.get("x-user-role") as UserRole | null;

  if (!userId || !email || !name || !role) {
    return null;
  }

  return {
    id: userId,
    email,
    name,
    role,
  };
}
