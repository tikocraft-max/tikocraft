import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/security";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/sanitize";

export async function GET(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("tikocraft-admin-session");
  if (!token?.value) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { email, valid } = verifySessionToken(token.value);
  if (!valid || !email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ip = getClientIp(req);
  const rl = checkRateLimit(`github-token:${ip}`, RATE_LIMITS.admin);
  if (rl.blocked) return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  const githubToken = process.env.GITHUB_TOKEN || "";
  if (!githubToken) return NextResponse.json({ error: "GITHUB_TOKEN not configured" }, { status: 500 });
  return NextResponse.json({ token: githubToken });
}
