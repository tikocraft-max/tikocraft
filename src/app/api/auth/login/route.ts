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

// POST /api/auth/login — secure login with rate limiting + signed session
export async function POST(req: NextRequest) {
  try {
    // Ensure admin user exists in GitHub-backed storage
    await ensureGitHubSeeded();

    const ip = getClientIp(req);

    // 1. Rate limit check
    if (isIpBlocked(ip)) {
      return NextResponse.json(
        {
          error: "Too many failed attempts. Please try again in 15 minutes.",
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const email = (body?.email || "").toString().trim().toLowerCase();
    const password = (body?.password || "").toString();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    // 2. Look up admin from GitHub-backed JSON file
    const admin = await getAdmin();

    if (!admin || admin.email.toLowerCase() !== email) {
      recordFailedLogin(ip);
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 3. Verify password
    const ok = await bcrypt.compare(password, admin.password);
    if (!ok) {
      recordFailedLogin(ip);
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 4. Success
    recordSuccessfulLogin(ip);

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
