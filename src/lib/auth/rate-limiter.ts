// =============================================================================
// Rate Limiter — In-memory sliding window for API protection
// =============================================================================

interface RateLimitEntry {
  count: number;
  resetAt: number;
  blockedUntil?: number;
}

const store = new Map<string, RateLimitEntry>();

// Auto-cleanup every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (now > entry.resetAt && (!entry.blockedUntil || now > entry.blockedUntil)) {
      store.delete(key);
    }
  }
}

export interface RateLimitConfig {
  /** Maximum requests in window */
  maxRequests: number;
  /** Window duration in seconds */
  windowSeconds: number;
  /** Block duration in seconds after exceeding limit */
  blockSeconds?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds?: number;
}

/**
 * Check rate limit for a given identifier (IP, user ID, etc.)
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  cleanup();
  const now = Date.now();
  const key = `${config.maxRequests}:${config.windowSeconds}:${identifier}`;

  const existing = store.get(key);

  // Check if currently blocked
  if (existing?.blockedUntil && now < existing.blockedUntil) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((existing.blockedUntil - now) / 1000),
    };
  }

  // Reset window if expired
  if (!existing || now > existing.resetAt) {
    store.set(key, {
      count: 1,
      resetAt: now + config.windowSeconds * 1000,
    });
    return { allowed: true, remaining: config.maxRequests - 1 };
  }

  // Increment counter
  existing.count++;

  if (existing.count > config.maxRequests) {
    // Block if configured
    if (config.blockSeconds) {
      existing.blockedUntil = now + config.blockSeconds * 1000;
    }
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: config.blockSeconds || Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  return { allowed: true, remaining: config.maxRequests - existing.count };
}

// Pre-configured rate limits
export const RATE_LIMITS = {
  /** Login: 5 tentativas por 15 min, bloqueia por 30 min */
  login: { maxRequests: 5, windowSeconds: 900, blockSeconds: 1800 } as RateLimitConfig,
  /** Registro: 3 por hora */
  register: { maxRequests: 3, windowSeconds: 3600 } as RateLimitConfig,
  /** Reset de senha: 3 por hora */
  passwordReset: { maxRequests: 3, windowSeconds: 3600 } as RateLimitConfig,
  /** API Geral: 60 por minuto (reduzido de 100) */
  api: { maxRequests: 60, windowSeconds: 60, blockSeconds: 120 } as RateLimitConfig,
  /** Webhook: 200 por minuto */
  webhook: { maxRequests: 200, windowSeconds: 60 } as RateLimitConfig,
  /** Consulta de Placa: 10 por hora por IP — protege créditos da API paga */
  placa: { maxRequests: 10, windowSeconds: 3600, blockSeconds: 3600 } as RateLimitConfig,
  /** Orçamentos: 5 por minuto por usuário */
  quotes: { maxRequests: 5, windowSeconds: 60, blockSeconds: 300 } as RateLimitConfig,
  /** Upload de arquivos: 20 por hora por IP */
  upload: { maxRequests: 20, windowSeconds: 3600, blockSeconds: 1800 } as RateLimitConfig,
  /** Chat: 30 mensagens por minuto */
  chat: { maxRequests: 30, windowSeconds: 60, blockSeconds: 60 } as RateLimitConfig,
} as const;

/**
 * Get client IP from request headers securely
 * Order of trust:
 * 1. cf-connecting-ip (Cloudflare)
 * 2. x-vercel-proxied-for (Vercel)
 * 3. x-real-ip (Standard reverse proxy)
 * 4. x-forwarded-for (Fallback)
 */
export function getClientIp(headers: Headers): string {
  const cfConnectingIp = headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp.trim();

  const vercelIp = headers.get("x-vercel-proxied-for")?.split(",")[0];
  if (vercelIp) return vercelIp.trim();

  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const forwardedFor = headers.get("x-forwarded-for")?.split(",")[0];
  if (forwardedFor) return forwardedFor.trim();

  return "unknown";
}
