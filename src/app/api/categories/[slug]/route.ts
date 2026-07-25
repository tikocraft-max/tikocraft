import { NextRequest, NextResponse } from "next/server";
import { getAllCategories, saveCategory, deleteCategory, type StoredCategory } from "@/lib/github-db";
import { cookies } from "next/headers";
import { z } from "zod";
import { verifySessionToken } from "@/lib/security";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("tikocraft-admin-session");
  if (!token?.value) return null;
  const { email, valid } = verifySessionToken(token.value);
  if (!valid || !email) return null;
  return { email, name: "Admin", role: "owner" };
}

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  subtitle: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  categoryType: z.enum(["decor", "booknook"]).optional(),
  sortOrder: z.number().optional(),
});

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

  try {
    const { slug } = await params;
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid update data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const categories = await getAllCategories();
    const existing = categories.find((c) => c.slug === slug);
    if (!existing) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const updated: StoredCategory = { ...existing, ...parsed.data };
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
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Unauthorized — admin login required" },
      { status: 401 }
    );
  }

  try {
    const { slug } = await params;
    const ok = await deleteCategory(slug);
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
