import { NextRequest, NextResponse } from "next/server";
import { getAllCategories, saveCategory, deleteCategory, type StoredCategory } from "@/lib/github-db";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/security";
import {
  sanitizeString,
  sanitizeSlug,
  sanitizeNumber,
  checkRateLimit,
  getClientIp,
  RATE_LIMITS,
} from "@/lib/sanitize";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("tikocraft-admin-session");
  if (!token?.value) return null;
  const { email, valid } = verifySessionToken(token.value);
  if (!valid || !email) return null;
  return { email, name: "Admin", role: "owner" };
}

// PATCH /api/categories/[slug] — update category (admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Unauthorized — admin login required" },
      { status: 401 }
    );
  }

  // Rate limit
  const ip = getClientIp(req);
  const rl = checkRateLimit(`categories:patch:${ip}`, RATE_LIMITS.admin);
  if (rl.blocked) return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  try {
    const { slug } = await params;
    const body = await req.json();

    const categories = await getAllCategories();
    const existing = categories.find((c) => c.slug === slug);
    if (!existing) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Sanitize only provided fields
    const updated: StoredCategory = {
      ...existing,
      name: body.name !== undefined ? sanitizeString(body.name, 200) : existing.name,
      subtitle: body.subtitle !== undefined ? (body.subtitle ? sanitizeString(body.subtitle, 200) : null) : existing.subtitle,
      description: body.description !== undefined ? (body.description ? sanitizeString(body.description, 2000) : null) : existing.description,
      image: body.image !== undefined ? (body.image ? sanitizeString(body.image, 2000) : null) : existing.image,
      categoryType: body.categoryType !== undefined ? (body.categoryType === "decor" ? "decor" : "booknook") : existing.categoryType,
      sortOrder: body.sortOrder !== undefined ? sanitizeNumber(body.sortOrder, 0, 9999) : existing.sortOrder,
    };

    const ok = await saveCategory(updated);
    if (!ok) {
      return NextResponse.json(
        { error: "Failed to update category" },
        { status: 500 }
      );
    }

    return NextResponse.json({ category: updated });
  } catch (err) {
    console.error("PATCH /api/categories/[slug] error", err);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[slug] — delete category (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Unauthorized — admin login required" },
      { status: 401 }
    );
  }

  // Rate limit
  const ip = getClientIp(req);
  const rl = checkRateLimit(`categories:delete:${ip}`, RATE_LIMITS.admin);
  if (rl.blocked) return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  try {
    const { slug } = await params;
    const cleanSlug = sanitizeSlug(slug);
    const ok = await deleteCategory(cleanSlug);
    if (!ok) {
      return NextResponse.json(
        { error: "Category not found or delete failed" },
        { status: 404 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/categories/[slug] error", err);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
