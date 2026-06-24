import { cookies } from "next/headers";
import crypto from "crypto";

// =============================================================================
// CSRF Protection — Token-based for mutations
// =============================================================================

const CSRF_COOKIE = "agury_csrf";
const CSRF_HEADER = "x-csrf-token";

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Set CSRF token in cookie (call from page renders)
 */
export async function setCsrfCookie(): Promise<string> {
  const token = generateCsrfToken();
  const cookieStore = await cookies();
  cookieStore.set(CSRF_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24, // 24h
  });
  return token;
}

/**
 * Validate CSRF token from request header against cookie
 */
export async function validateCsrfToken(headers: Headers): Promise<boolean> {
  const headerToken = headers.get(CSRF_HEADER);
  if (!headerToken) return false;

  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_COOKIE)?.value;
  if (!cookieToken) return false;

  // Constant-time comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(headerToken),
      Buffer.from(cookieToken)
    );
  } catch {
    return false;
  }
}

export { CSRF_COOKIE, CSRF_HEADER };
