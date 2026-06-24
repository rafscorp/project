import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { UserRole } from "@prisma/client";

// =============================================================================
// Session Management — JWT + Secure Cookies
// =============================================================================

/** Payload do token JWT de sessão */
export interface SessionPayload {
  userId: string;
  email: string;
  username: string;
  name: string;
  role: UserRole;
  storeId?: string;
  sessionId?: string;
}

export const COOKIE_NAME = "agury_session";
export const REFRESH_COOKIE_NAME = "agury_refresh";

const SHORT_MAX_AGE = 60 * 60 * 24; // 24h
const LONG_MAX_AGE = 60 * 60 * 24 * 30; // 30 days (remember me)

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET deve ter pelo menos 32 caracteres");
  }
  return new TextEncoder().encode(secret);
}

/** Cria JWT assinado */
export async function createSessionToken(
  payload: SessionPayload,
  rememberMe = false
): Promise<string> {
  const maxAge = rememberMe ? LONG_MAX_AGE : SHORT_MAX_AGE;
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${maxAge}s`)
    .sign(getSecret());
}

/** Valida e decodifica JWT */
export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/** Define cookie de sessão httpOnly */
export async function setSessionCookie(
  payload: SessionPayload,
  rememberMe = false
) {
  const maxAge = rememberMe ? LONG_MAX_AGE : SHORT_MAX_AGE;
  const token = await createSessionToken(payload, rememberMe);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge,
    path: "/",
  });
}

/** Remove sessão */
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  cookieStore.delete(REFRESH_COOKIE_NAME);
}

/** Lê sessão atual do cookie (Server Components / API) */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
