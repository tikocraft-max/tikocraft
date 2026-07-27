// ============================================================
// Security utilities — rate limiting, signed sessions, hashing
// ============================================================

import { createHmac, timingSafeEqual } from "crypto";

// ============================================================
// 1. Rate limiting — per email + per IP
//    On Vercel serverless, each request may come from a different IP,
//    so we also rate-limit by email (which is consistent across requests).
// ============================================================

interface RateLimitEntry {
  failures: number;
  firstFailedAt: number;
  blockedUntil: number; // 0 if not blocked
}

// Use a global Map so it survives hot reloads in dev
// and persists across requests within the same serverless instance
const rateLimitStore = globalThis as unknown as {
  __loginRateLimit?: Map<string, RateLimitEntry>;
};
if (!rateLimitStore.__loginRateLimit) {
  rateLimitStore.__loginRateLimit = new Map();
}
const rateLimitMap = rateLimitStore.__loginRateLimit;

const MAX_FAILURES = 5; // block after 5 failures
const BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const FAILURE_WINDOW_MS = 15 * 60 * 1000; // failures expire after 15 min

export function isIpBlocked(key: string): boolean {
  const entry = rateLimitMap.get(key);
  if (!entry) return false;
  if (entry.blockedUntil > Date.now()) return true;
  // Block expired — clear it
  if (entry.blockedUntil > 0 && entry.blockedUntil <= Date.now()) {
    rateLimitMap.delete(key);
    return false;
  }
  return false;
}

export function getBlockTimeRemaining(key: string): number {
  const entry = rateLimitMap.get(key);
  if (!entry || entry.blockedUntil <= Date.now()) return 0;
  return Math.ceil((entry.blockedUntil - Date.now()) / 1000);
}

export function recordFailedLogin(key: string): void {
  const now = Date.now();
  let entry = rateLimitMap.get(key);
  if (!entry) {
    entry = { failures: 0, firstFailedAt: now, blockedUntil: 0 };
    rateLimitMap.set(key, entry);
  }
  // Reset window if first failure was too long ago
  if (now - entry.firstFailedAt > FAILURE_WINDOW_MS) {
    entry = { failures: 0, firstFailedAt: now, blockedUntil: 0 };
    rateLimitMap.set(key, entry);
  }
  entry.failures += 1;
  if (entry.failures >= MAX_FAILURES) {
    entry.blockedUntil = now + BLOCK_DURATION_MS;
  }
}

export function recordSuccessfulLogin(key: string): void {
  rateLimitMap.delete(key);
}

// ============================================================
// 2. Signed session tokens — HMAC-signed, tamper-proof
//    Format: <email>.<expiryTimestamp>.<hmac>
// ============================================================

const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  // Fallback: derive from DATABASE_URL so it's stable across cold starts
  "tikocraft-session-fallback-secret-change-me-" +
    (process.env.DATABASE_URL?.slice(-20) || "default");

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function sign(payload: string): string {
  return createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
}

export function createSessionToken(email: string): string {
  const expiry = Date.now() + SESSION_DURATION_MS;
  // Use | as separator — it never appears in emails (and we URL-encode anyway)
  const payload = `${encodeURIComponent(email)}|${expiry}`;
  const signature = sign(payload);
  return `${payload}|${signature}`;
}

export function verifySessionToken(token: string): { email: string; valid: boolean } {
  if (!token) return { email: "", valid: false };
  const parts = token.split("|");
  if (parts.length !== 3) return { email: "", valid: false };
  const [emailEncoded, expiryStr, signature] = parts;
  const payload = `${emailEncoded}|${expiryStr}`;

  // Constant-time comparison to prevent timing attacks
  const expectedSig = sign(payload);
  try {
    const sigBuf = Buffer.from(signature, "hex");
    const expectedBuf = Buffer.from(expectedSig, "hex");
    if (sigBuf.length !== expectedBuf.length) {
      return { email: "", valid: false };
    }
    if (!timingSafeEqual(sigBuf, expectedBuf)) {
      return { email: "", valid: false };
    }
  } catch {
    return { email: "", valid: false };
  }

  // Check expiry
  const expiry = parseInt(expiryStr, 10);
  if (isNaN(expiry) || expiry < Date.now()) {
    return { email: "", valid: false };
  }

  return { email: decodeURIComponent(emailEncoded), valid: true };
}

// ============================================================
// 3. Get client IP — handles Vercel's forwarding headers
// ============================================================

export function getClientIp(req: Request): string {
  const headers = req.headers;
  return (
    headers.get("x-real-ip") ||
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}
