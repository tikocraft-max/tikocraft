import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { z } from "zod";

async function requireAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get("tikocraft-admin-session");
  const email = cookieStore.get("tikocraft-admin-email");
  if (!session?.value || !email?.value) return null;
  try {
    return await db.adminUser.findUnique({
      where: { email: email.value },
      select: { email: true, name: true, role: true },
    });
  } catch {
    return null;
  }
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

    const category = await db.category.update({
      where: { slug },
      data: parsed.data,
    });
    return NextResponse.json({ category });
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
    // First check if any products exist in this category
    const productCount = await db.product.count({
      where: { categorySlug: slug },
    });
    if (productCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete — ${productCount} product(s) still in this category. Move or delete them first.`,
        },
        { status: 400 }
      );
    }
    await db.category.delete({ where: { slug } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/categories/[slug] error", err);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
