import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import {
  isIpBlocked,
  recordFailedLogin,
  recordSuccessfulLogin,
  createSessionToken,
  getClientIp,
} from "@/lib/security";

// POST /api/auth/login — secure login with rate limiting + signed session
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);

    // 1. Rate limit check — block IPs with too many failures
    if (isIpBlocked(ip)) {
      return NextResponse.json(
        {
          error:
            "Too many failed attempts. Please try again in 15 minutes.",
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    // 2. Look up admin — constant error message so attackers can't tell
    //    if email exists vs password is wrong
    const admin = await db.adminUser.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!admin) {
      recordFailedLogin(ip);
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 3. Verify password (bcrypt handles timing safely)
    const ok = await bcrypt.compare(password, admin.password);
    if (!ok) {
      recordFailedLogin(ip);
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 4. Success — clear rate limit + create signed session
    recordSuccessfulLogin(ip);

    const token = createSessionToken(admin.email);
    const cookieStore = await cookies();
    cookieStore.set("tikocraft-admin-session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict", // strict — admin cookie never sent on cross-site requests
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Don't store email in a separate cookie — the signed token already
    // contains it (encoded), so we can verify identity without leaking.

    return NextResponse.json({
      ok: true,
      admin: { email: admin.email, name: admin.name, role: admin.role },
    });
  } catch (err) {
    console.error("POST /api/auth/login error", err);
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}
