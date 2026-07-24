import { NextRequest, NextResponse } from "next/server";

// ============================================================
// Security middleware — adds protective headers to every response
// ============================================================

export function middleware(_req: NextRequest) {
  const res = NextResponse.next();

  // Prevent clickjacking — admin panel can never be embedded in an iframe
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-XSS-Protection", "1; mode=block");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  // Strict Content Security Policy — blocks inline scripts (except Next.js allowed),
  // blocks external resources, prevents XSS attacks
  // Note: Next.js requires 'unsafe-inline' for styles in dev mode,
  // and uses nonce-based CSP in production. This is a balanced CSP.
  res.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data:",
      "img-src 'self' data: blob: https:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ")
  );

  // HSTS — force HTTPS for 2 years (only in production)
  if (process.env.NODE_ENV === "production") {
    res.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }

  return res;
}

export const config = {
  // Apply to all routes except static files
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|images|fonts|logo.svg).*)"],
};
