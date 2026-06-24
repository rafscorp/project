// =============================================================================
// Input Sanitization — XSS Protection
// =============================================================================

/**
 * Sanitize a string to prevent XSS attacks.
 * Escapes HTML entities in user input.
 */
export function sanitizeHtml(input: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
    "`": "&#96;",
  };
  return input.replace(/[&<>"'/`]/g, (char) => map[char] || char);
}

/**
 * Strip all HTML tags from a string
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "");
}

/**
 * Sanitize an object recursively — all string values are sanitized
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result = { ...obj };
  for (const [key, value] of Object.entries(result)) {
    if (typeof value === "string") {
      (result as Record<string, unknown>)[key] = sanitizeHtml(value);
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      (result as Record<string, unknown>)[key] = sanitizeObject(
        value as Record<string, unknown>
      );
    }
  }
  return result;
}

/**
 * Sanitize for SQL — prevent SQL injection via input
 * (Prisma already parameterizes queries, but this is defense-in-depth)
 */
export function sanitizeSqlInput(input: string): string {
  return input.replace(/['";\\]/g, "");
}

/**
 * Trim and normalize whitespace in a string
 */
export function normalizeInput(input: string): string {
  return input.trim().replace(/\s+/g, " ");
}
