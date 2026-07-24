import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// POST /api/auth/logout — clears session cookies
export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("tikocraft-admin-session");
  cookieStore.delete("tikocraft-admin-email");
  return NextResponse.json({ ok: true });
}
