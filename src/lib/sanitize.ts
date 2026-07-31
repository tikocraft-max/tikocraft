// ============================================================
// Input sanitization + validation utilities
// Use these on ALL API routes to prevent XSS, injection, and
// payload attacks.
// ============================================================

/**
 * Sanitize a string input:
 * - Trims whitespace
 * - Strips HTML tags (<script>, <img onerror=...>, etc.)
 * - Removes null bytes
 * - Limits length to prevent DoS via huge payloads
 */
export function sanitizeString(input: unknown, maxLength = 10000): string {
  if (input === null || input === undefined) return "";
  let str = String(input);
  // Remove null bytes
  str = str.replace(/\0/g, "");
  // Strip HTML tags (basic XSS prevention)
  str = str.replace(/<[^>]*>/g, "");
  // Trim
  str = str.trim();
  // Limit length
  if (str.length > maxLength) {
    str = str.substring(0, maxLength);
  }
  return str;
}

/**
 * Sanitize a slug (URL-safe identifier):
 * - Only allows lowercase letters, numbers, and hyphens
 * - Max 200 chars
 */
export function sanitizeSlug(input: unknown): string {
  if (input === null || input === undefined) return "";
  let str = String(input).toLowerCase().trim();
  str = str.replace(/[^a-z0-9-]/g, "");
  str = str.replace(/-{2,}/g, "-");
  str = str.replace(/^-|-$/g, "");
  return str.substring(0, 200);
}

/**
 * Validate and sanitize an email address
 */
export function sanitizeEmail(input: unknown): string {
  const str = sanitizeString(input, 320); // RFC 5321 max
  // Basic email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(str)) return "";
  return str.toLowerCase();
}

/**
 * Validate a number is positive and finite
 */
export function sanitizeNumber(input: unknown, min = 0, max = 1000000): number {
  const num = Number(input);
  if (!isFinite(num) || isNaN(num)) return min;
  return Math.max(min, Math.min(max, num));
}

/**
 * Sanitize an array of strings (e.g., image URLs)
 */
export function sanitizeStringArray(input: unknown, maxLength = 100): string[] {
  if (!Array.isArray(input)) return [];
  return input
    .slice(0, maxLength)
    .map((item) => sanitizeString(item, 2000))
    .filter((s) => s.length > 0);
}

/**
 * Validate a URL (for images, videos, etc.)
 * Only allows http, https, and relative paths (starting with /)
 */
export function sanitizeUrl(input: unknown, maxLength = 2000): string {
  const str = sanitizeString(input, maxLength);
  if (str === "") return "";
  // Allow relative paths
  if (str.startsWith("/")) return str;
  // Allow data: URLs (for uploaded images)
  if (str.startsWith("data:image/") || str.startsWith("data:video/")) {
    return str.substring(0, maxLength);
  }
  // Allow http/https URLs
  try {
    const url = new URL(str);
    if (url.protocol === "http:" || url.protocol === "https:") {
      return str;
    }
  } catch {
    // Invalid URL
  }
  return "";
}

/**
 * Sanitize a boolean value
 */
export function sanitizeBoolean(input: unknown): boolean {
  return input === true || input === 1 || input === "true" || input === "1";
}

// ============================================================
// General-purpose API rate limiter
// ============================================================

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  blockMs: number;
}

const apiRateLimitStore = globalThis as unknown as {
  __apiRateLimit?: Map<string, { count: number; firstAt: number; blockedUntil: number }>;
};
if (!apiRateLimitStore.__apiRateLimit) {
  apiRateLimitStore.__apiRateLimit = new Map();
}
const apiRateLimitMap = apiRateLimitStore.__apiRateLimit;

/**
 * Check if an IP/key is rate limited.
 * Returns { blocked, remaining } info.
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): { blocked: boolean; remaining: number; retryAfter: number } {
  const now = Date.now();
  let entry = apiRateLimitMap.get(key);

  // Clean up expired blocks
  if (entry && entry.blockedUntil > 0 && entry.blockedUntil <= now) {
    apiRateLimitMap.delete(key);
    entry = undefined;
  }

  // Check if currently blocked
  if (entry && entry.blockedUntil > now) {
    return {
      blocked: true,
      remaining: 0,
      retryAfter: Math.ceil((entry.blockedUntil - now) / 1000),
    };
  }

  // Initialize or check window
  if (!entry || now - entry.firstAt > config.windowMs) {
    entry = { count: 0, firstAt: now, blockedUntil: 0 };
    apiRateLimitMap.set(key, entry);
  }

  entry.count += 1;

  if (entry.count > config.maxRequests) {
    entry.blockedUntil = now + config.blockMs;
    return {
      blocked: true,
      remaining: 0,
      retryAfter: Math.ceil(config.blockMs / 1000),
    };
  }

  return {
    blocked: false,
    remaining: config.maxRequests - entry.count,
    retryAfter: 0,
  };
}

/**
 * Get client IP from request headers (Vercel-compatible)
 */
export function getClientIp(req: Request): string {
  return (
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

// ============================================================
// Rate limit configs for different endpoint types
// ============================================================

export const RATE_LIMITS = {
  // Public read endpoints (catalog, categories)
  read: { maxRequests: 60, windowMs: 60 * 1000, blockMs: 30 * 1000 },

  // Public write endpoints (custom orders)
  write: { maxRequests: 10, windowMs: 60 * 1000, blockMs: 5 * 60 * 1000 },

  // Auth endpoints (login)
  auth: { maxRequests: 5, windowMs: 15 * 60 * 1000, blockMs: 15 * 60 * 1000 },

  // Admin write endpoints (products, categories)
  admin: { maxRequests: 30, windowMs: 60 * 1000, blockMs: 60 * 1000 },

  // Upload endpoints
  upload: { maxRequests: 10, windowMs: 60 * 1000, blockMs: 5 * 60 * 1000 },

  // Stripe webhook
  webhook: { maxRequests: 100, windowMs: 60 * 1000, blockMs: 30 * 1000 },
};
