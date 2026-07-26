import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/security";

// ============================================================
// POST /api/upload/video
// Accepts a video file upload (multipart/form-data), stores it
// as a separate file in the GitHub repo (data/videos/), and
// returns the raw URL that can be used as the videoUrl field.
//
// This avoids storing large base64 strings in products.json
// (which would exceed GitHub API limits).
// ============================================================

// Allow up to 60 seconds for large uploads
export const maxDuration = 60;

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const REPO_OWNER = "tikocraft-max";
const REPO_NAME = "tikocraft";
const BRANCH = "main";
const MAX_VIDEO_SIZE = 4 * 1024 * 1024; // 4MB max (Vercel hobby limit is 4.5MB)

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
    return NextResponse.json(
      { error: "Unauthorized — admin login required" },
      { status: 401 }
    );
  }

  if (!GITHUB_TOKEN) {
    return NextResponse.json(
      { error: "Server not configured — GITHUB_TOKEN missing" },
      { status: 500 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("video") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No video file provided" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("video/")) {
      return NextResponse.json(
        { error: "Please select a video file (MP4, WebM, or MOV)" },
        { status: 400 }
      );
    }

    if (file.size > MAX_VIDEO_SIZE) {
      return NextResponse.json(
        {
          error: `Video is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is ${MAX_VIDEO_SIZE / 1024 / 1024}MB for direct upload. For larger videos, please upload to YouTube/Vimeo and paste the URL instead.`,
        },
        { status: 400 }
      );
    }

    // Generate a unique filename
    const ext = file.name.split(".").pop() || "mp4";
    const filename = `video_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const path = `data/videos/${filename}`;

    // Read file as base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Content = buffer.toString("base64");

    // Upload to GitHub repo as a separate file
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
      const errBody = await githubRes.text();
      console.error("[upload/video] GitHub API error:", githubRes.status, errBody);
      return NextResponse.json(
        {
          error: `Failed to upload video to GitHub (${githubRes.status}). ${
            githubRes.status === 422 ? "File may already exist." : ""
          }`,
        },
        { status: 500 }
      );
    }

    const githubData = await githubRes.json();

    // Construct the raw URL (publicly accessible)
    // Format: https://raw.githubusercontent.com/owner/repo/branch/path
    const rawUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${path}`;

    return NextResponse.json({
      ok: true,
      url: rawUrl,
      filename,
      size: file.size,
      sha: githubData.content?.sha,
    });
  } catch (err) {
    console.error("[upload/video] error:", err);
    return NextResponse.json(
      { error: "Failed to upload video — please try again" },
      { status: 500 }
    );
  }
}
