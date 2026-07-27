import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/security";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const REPO_OWNER = "tikocraft-max";
const REPO_NAME = "tikocraft";
const BRANCH = "main";
const MAX_VIDEO_SIZE = 4 * 1024 * 1024;

export const maxDuration = 60;

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("tikocraft-admin-session");
  if (!token?.value) return null;
  const { email, valid } = verifySessionToken(token.value);
  if (!valid || !email) return null;
  return { email, name: "Admin", role: "owner" };
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!GITHUB_TOKEN) {
    return NextResponse.json({ error: "GITHUB_TOKEN missing" }, { status: 500 });
  }
  try {
    const formData = await req.formData();
    const file = formData.get("video") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No video file" }, { status: 400 });
    }
    if (!file.type.startsWith("video/")) {
      return NextResponse.json({ error: "Not a video file" }, { status: 400 });
    }
    if (file.size > MAX_VIDEO_SIZE) {
      return NextResponse.json({ error: "Too large (max 4MB)" }, { status: 400 });
    }
    const ext = file.name.split(".").pop() || "mp4";
    const filename = `video_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const path = `data/videos/${filename}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Content = buffer.toString("base64");
    const githubRes = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `upload video: ${filename}`,
          content: base64Content,
          branch: BRANCH,
        }),
      }
    );
    if (!githubRes.ok) {
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
    const rawUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${path}`;
    return NextResponse.json({ ok: true, url: rawUrl, filename, size: file.size });
  } catch (err) {
    console.error("[upload/video] error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
