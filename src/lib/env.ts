import { z } from "zod";

// =============================================================================
// Environment Variable Schema — Fail-fast validation at startup
// =============================================================================

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // Auth
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters"),
  SESSION_SECRET: z
    .string()
    .min(32, "SESSION_SECRET must be at least 32 characters")
    .optional()
    .default(""),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_NAME: z.string().default("Agury Auto"),
  NODE_ENV: z
    .enum(["development", "staging", "production", "test"])
    .default("development"),

  // Email (optional — console fallback in dev)
  RESEND_API_KEY: z.string().optional(),
  SENDGRID_API_KEY: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().optional(),
  EMAIL_FROM: z.string().email().optional().default("noreply@agury.com.br"),

  // Payments (optional — activated when keys are set)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  MERCADOPAGO_ACCESS_TOKEN: z.string().optional(),
  MERCADOPAGO_WEBHOOK_SECRET: z.string().optional(),

  // Affiliate
  AFFILIATE_DEFAULT_COMMISSION: z
    .string()
    .transform(Number)
    .pipe(z.number().min(0).max(100))
    .optional()
    .default("10"),
  AFFILIATE_COOKIE_DAYS: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1).max(365))
    .optional()
    .default("30"),
});

// ---------------------------------------------------------------------------
// Parse & Export
// ---------------------------------------------------------------------------

function parseEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    const formatted = Object.entries(errors)
      .map(([key, msgs]) => `  ${key}: ${msgs?.join(", ")}`)
      .join("\n");

    console.error(
      "\n❌ Invalid environment variables:\n" + formatted + "\n"
    );

    // CRITICAL SECURITY FIX: Never use hardcoded fallbacks for secrets.
    // If the .env is missing or invalid, the app MUST crash to prevent security breaches.
    throw new Error("Missing or invalid environment variables. Check the console for details.");
  }

  return parsed.data;
}

export const env = parseEnv();

export type Env = z.infer<typeof envSchema>;
