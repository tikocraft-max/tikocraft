import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifySessionToken } from "@/lib/security";

// GET /api/auth/session — returns current admin user or null
// Verifies the signed session token (HMAC) — token can't be forged.
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("tikocraft-admin-session");

  if (!token?.value) {
    return NextResponse.json({ admin: null });
  }

  // 1. Verify the HMAC signature + expiry
  const { email, valid } = verifySessionToken(token.value);
  if (!valid || !email) {
    return NextResponse.json({ admin: null });
  }

  // 2. Confirm the admin still exists in DB (in case they were removed)
  try {
    const admin = await db.adminUser.findUnique({
      where: { email },
      select: { email: true, name: true, role: true },
    });
    if (!admin) {
      return NextResponse.json({ admin: null });
    }
    return NextResponse.json({ admin });
  } catch {
    return NextResponse.json({ admin: null });
  }
}
