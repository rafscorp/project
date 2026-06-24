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
  /** Login: 5 attempts per 15 minutes, block 30 min */
  login: { maxRequests: 5, windowSeconds: 900, blockSeconds: 1800 } as RateLimitConfig,
  /** Registration: 3 per hour */
  register: { maxRequests: 3, windowSeconds: 3600 } as RateLimitConfig,
  /** Password reset: 3 per hour */
  passwordReset: { maxRequests: 3, windowSeconds: 3600 } as RateLimitConfig,
  /** General API: 100 per minute */
  api: { maxRequests: 100, windowSeconds: 60 } as RateLimitConfig,
  /** Webhook: 200 per minute */
  webhook: { maxRequests: 200, windowSeconds: 60 } as RateLimitConfig,
} as const;

/**
 * Get client IP from request headers
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}
