import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/security";
import { getAdmin, ensureGitHubSeeded } from "@/lib/github-db";

// GET /api/auth/session — returns current admin user or null
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("tikocraft-admin-session");

  if (!token?.value) {
    return NextResponse.json({ admin: null });
  }

  const { email, valid } = verifySessionToken(token.value);
  if (!valid || !email) {
    return NextResponse.json({ admin: null });
  }

  try {
    await ensureGitHubSeeded();
    const admin = await getAdmin();
    if (!admin || admin.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ admin: null });
    }
    return NextResponse.json({
      admin: { email: admin.email, name: admin.name, role: admin.role },
    });
  } catch {
    return NextResponse.json({ admin: null });
  }
}
