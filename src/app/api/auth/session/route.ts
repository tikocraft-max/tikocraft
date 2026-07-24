import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

// GET /api/auth/session — returns current admin user or null
export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("tikocraft-admin-session");
  const email = cookieStore.get("tikocraft-admin-email");

  if (!session?.value || !email?.value) {
    return NextResponse.json({ admin: null });
  }

  try {
    const admin = await db.adminUser.findUnique({
      where: { email: email.value },
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
