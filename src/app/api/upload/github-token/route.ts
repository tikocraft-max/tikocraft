import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/security";

// GET /api/upload/github-token
// Returns the GitHub token to authenticated admins only.
// Used for direct browser→GitHub video uploads (bypasses Vercel's
// 4.5MB body size limit on Hobby plan).
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("tikocraft-admin-session");
  if (!token?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email, valid } = verifySessionToken(token.value);
  if (!valid || !email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const githubToken = process.env.GITHUB_TOKEN || "";
  if (!githubToken) {
    return NextResponse.json(
      { error: "GITHUB_TOKEN not configured on server" },
      { status: 500 }
    );
  }

  return NextResponse.json({ token: githubToken });
}
