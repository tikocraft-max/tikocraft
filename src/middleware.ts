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

  // Content Security Policy — allows:
  // - self for everything
  // - GitHub API for direct video uploads from admin
  // - raw.githubusercontent.com for video playback
  // - YouTube/Vimeo for video embeds
  // - data:/blob: for images and uploaded media
  res.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://player.vimeo.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data:",
      "img-src 'self' data: blob: https:",
      "media-src 'self' data: blob: https: https://raw.githubusercontent.com",
      "connect-src 'self' https://api.github.com https://raw.githubusercontent.com",
      "frame-src 'self' https://www.youtube.com https://player.vimeo.com",
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
