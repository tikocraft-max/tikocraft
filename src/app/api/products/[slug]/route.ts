import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { z } from "zod";
import { verifySessionToken } from "@/lib/security";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("tikocraft-admin-session");
  if (!token?.value) return null;
  const { email, valid } = verifySessionToken(token.value);
  if (!valid || !email) return null;
  try {
    return await db.adminUser.findUnique({
      where: { email },
      select: { email: true, name: true, role: true },
    });
  } catch {
    return null;
  }
}

// GET /api/products/[slug] — fetch a single product
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const product = await db.product.findUnique({
      where: { slug },
      include: { category: true },
    });
    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ product });
  } catch (err) {
    console.error("GET /api/products/[slug] error", err);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  categorySlug: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  priceUSD: z.number().positive().optional(),
  tag: z.string().nullable().optional(),
  image: z.string().min(1).optional(),
  images: z.array(z.string()).nullable().optional(),
  videoUrl: z.string().nullable().optional(),
  material: z.string().nullable().optional(),
  dimensions: z.string().nullable().optional(),
  isPublished: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

// PATCH /api/products/[slug] — update product (admin only)
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

    const { images, ...rest } = parsed.data;
    const updateData: Record<string, unknown> = { ...rest };
    // Convert images array to JSON string for storage
    if (images !== undefined) {
      updateData.images = images && images.length > 0 ? JSON.stringify(images) : null;
    }

    const product = await db.product.update({
      where: { slug },
      data: updateData,
    });
    return NextResponse.json({ product });
  } catch (err) {
    console.error("PATCH /api/products/[slug] error", err);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[slug] — delete product (admin only)
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
    await db.product.delete({ where: { slug } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/products/[slug] error", err);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
