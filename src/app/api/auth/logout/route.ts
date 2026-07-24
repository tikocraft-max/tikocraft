import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// POST /api/auth/logout — clears session cookie
export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("tikocraft-admin-session");
  // Also delete legacy cookie from previous version
  cookieStore.delete("tikocraft-admin-email");
  return NextResponse.json({ ok: true });
}
