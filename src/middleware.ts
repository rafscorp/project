import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, COOKIE_NAME } from "@/lib/auth/session";
import { applySecurityHeaders } from "@/lib/security/headers";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/auth/rate-limiter";

// ─── Lista de User-Agents suspeitos (bots/scanners maliciosos) ───────────────
const BLOCKED_UA_PATTERNS = [
  /sqlmap/i,
  /nikto/i,
  /nessus/i,
  /masscan/i,
  /zgrab/i,
  /python-requests\/[0-1]/i, // Versões antigas de requests Python
  /go-http-client\/1\.0/i,
  /nuclei/i,
  /dirbuster/i,
  /hydra/i,
];

// ─── Padrões de path traversal e injeção ─────────────────────────────────────
const BLOCKED_PATH_PATTERNS = [
  /\.\.\//,          // Path traversal ../
  /%2e%2e/i,         // Path traversal URL encoded
  /\/etc\/passwd/i,  // Unix file probe
  /\/proc\//i,       // Linux proc probe
  /\x00/,            // Null byte injection
];

/** Middleware Global de Segurança da Plataforma Agury */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getClientIp(request.headers);

  // ─── 1. Bloqueio de Path Traversal e Injeções ──────────────────────────────
  for (const pattern of BLOCKED_PATH_PATTERNS) {
    if (pattern.test(pathname)) {
      return new NextResponse("Bad Request", { status: 400 });
    }
  }

  // ─── 2. Bloqueio de User-Agents maliciosos ─────────────────────────────────
  const userAgent = request.headers.get("user-agent") ?? "";
  for (const pattern of BLOCKED_UA_PATTERNS) {
    if (pattern.test(userAgent)) {
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  // ─── 3. Rate Limiting Diferenciado por Rota ────────────────────────────────
  let rateLimitConfig = RATE_LIMITS.api;

  if (pathname.startsWith("/api/auth/login")) {
    rateLimitConfig = RATE_LIMITS.login;
  } else if (pathname.startsWith("/api/auth/register") || pathname.startsWith("/api/auth/forgot")) {
    rateLimitConfig = RATE_LIMITS.register;
  } else if (pathname.startsWith("/api/veiculos/placa")) {
    rateLimitConfig = RATE_LIMITS.placa;
  } else if (pathname.startsWith("/api/upload")) {
    rateLimitConfig = RATE_LIMITS.upload;
  } else if (pathname.startsWith("/api/quotes") || pathname.startsWith("/api/orcamentos")) {
    rateLimitConfig = RATE_LIMITS.quotes;
  } else if (pathname.startsWith("/api/chat") || pathname.startsWith("/api/messages")) {
    rateLimitConfig = RATE_LIMITS.chat;
  } else if (pathname.startsWith("/api/webhooks")) {
    rateLimitConfig = RATE_LIMITS.webhook;
  }

  const rateLimit = checkRateLimit(`${ip}:${pathname.split("/").slice(0, 3).join("/")}`, rateLimitConfig);

  if (!rateLimit.allowed) {
    return new NextResponse(
      JSON.stringify({ error: "Muitas requisições. Tente novamente em instantes." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(rateLimit.retryAfterSeconds ?? 60),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  // ─── 4. Verificação de Sessão ─────────────────────────────────────────────
  const token = request.cookies.get(COOKIE_NAME)?.value;
  let session = null;

  if (token) {
    session = await verifySessionToken(token);
  }

  // ─── 5. Redirecionamento para Usuário já Autenticado ──────────────────────
  const isAuthPage =
    pathname === "/" ||
    pathname === "/login" ||
    pathname.startsWith("/cadastro");

  if (isAuthPage && session) {
    if (session.role === "PLATFORM_ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (session.role === "STORE_OWNER" || session.role === "STORE_STAFF") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    if (session.role === "CUSTOMER") {
      return NextResponse.redirect(new URL("/cliente/home", request.url));
    }
  }

  // ─── 6. Proteção de Rotas Privadas (RBAC) ────────────────────────────────
  const protectedPrefixes = ["/dashboard", "/admin", "/cliente", "/conta"];
  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));

  if (isProtected) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (pathname.startsWith("/admin") && session.role !== "PLATFORM_ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (
      pathname.startsWith("/dashboard") &&
      !["STORE_OWNER", "STORE_STAFF", "PLATFORM_ADMIN"].includes(session.role)
    ) {
      return NextResponse.redirect(new URL("/cliente/home", request.url));
    }

    if (pathname.startsWith("/cliente") && session.role !== "CUSTOMER") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // ─── 7. Security Headers + Headers de Rastreabilidade ────────────────────
  const response = NextResponse.next();

  // ID único por requisição para rastreabilidade em logs
  response.headers.set(
    "X-Request-ID",
    `agury-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
  );
  response.headers.set("X-RateLimit-Remaining", String(rateLimit.remaining));

  return applySecurityHeaders(response);
}

export const config = {
  matcher: [
    // Aplica middleware em tudo EXCETO arquivos estáticos e imagens
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
