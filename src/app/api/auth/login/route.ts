import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { ensureSeeded } from "../../catalog/route";

// POST /api/auth/login — email + password, sets a session cookie
export async function POST(req: NextRequest) {
  try {
    // Ensure DB is seeded (cold-start safe)
    await ensureSeeded();

    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    const admin = await db.adminUser.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (!admin) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const ok = await bcrypt.compare(password, admin.password);
    if (!ok) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = randomBytes(32).toString("hex");
    const cookieStore = await cookies();
    cookieStore.set("tikocraft-admin-session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    cookieStore.set("tikocraft-admin-email", admin.email, {
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
      { error: "Login failed" },
      { status: 500 }
    );
  }
}
