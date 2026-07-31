import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import {
  isIpBlocked,
  recordFailedLogin,
  recordSuccessfulLogin,
  createSessionToken,
  getClientIp,
} from "@/lib/security";
import { getAdmin, ensureGitHubSeeded } from "@/lib/github-db";
import { sanitizeEmail, sanitizeString, checkRateLimit, RATE_LIMITS } from "@/lib/sanitize";

// POST /api/auth/login — secure login with rate limiting + signed session
export async function POST(req: NextRequest) {
  try {
    // Ensure admin user exists in GitHub-backed storage
    await ensureGitHubSeeded();

    const ip = getClientIp(req);

    // 1. Rate limit check — by IP AND by email (for Vercel where IP varies)
    const ipLimit = checkRateLimit(`login:ip:${ip}`, RATE_LIMITS.auth);
    if (ipLimit.blocked) {
      return NextResponse.json(
        { error: `Too many attempts. Retry in ${ipLimit.retryAfter}s.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const email = sanitizeEmail(body?.email);
    const password = sanitizeString(body?.password, 1000);

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    // Also rate-limit by email (consistent across Vercel requests)
    const emailLimit = checkRateLimit(`login:email:${email}`, RATE_LIMITS.auth);
    if (emailLimit.blocked) {
      return NextResponse.json(
        { error: `Too many attempts for this email. Retry in ${emailLimit.retryAfter}s.` },
        { status: 429 }
      );
    }

    // 2. Look up admin from GitHub-backed JSON file
    const admin = await getAdmin();

    if (!admin || admin.email.toLowerCase() !== email) {
      checkRateLimit(`login:ip:${ip}`, { maxRequests: 5, windowMs: 15 * 60 * 1000, blockMs: 15 * 60 * 1000 });
      checkRateLimit(`login:email:${email}`, { maxRequests: 5, windowMs: 15 * 60 * 1000, blockMs: 15 * 60 * 1000 });
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 3. Verify password
    const ok = await bcrypt.compare(password, admin.password);
    if (!ok) {
      checkRateLimit(`login:ip:${ip}`, { maxRequests: 5, windowMs: 15 * 60 * 1000, blockMs: 15 * 60 * 1000 });
      checkRateLimit(`login:email:${email}`, { maxRequests: 5, windowMs: 15 * 60 * 1000, blockMs: 15 * 60 * 1000 });
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 4. Success — clear rate limit
    recordSuccessfulLogin(ip);
    recordSuccessfulLogin(`email:${email}`);

    const token = createSessionToken(admin.email);
    const cookieStore = await cookies();
    cookieStore.set("tikocraft-admin-session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({
      ok: true,
      admin: { email: admin.email, name: admin.name, role: admin.role },
    });
  } catch (err) {
    console.error("POST /api/auth/login error", err);
    return NextResponse.json(
      { error: "Login failed — please try again" },
      { status: 500 }
    );
  }
}
