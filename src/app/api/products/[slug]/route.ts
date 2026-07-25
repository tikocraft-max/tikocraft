import { NextRequest, NextResponse } from "next/server";
import {
  getAllProducts,
  saveProduct,
  deleteProduct,
  type StoredProduct,
} from "@/lib/github-db";
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

// GET /api/products/[slug] — fetch a single product
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const products = await getAllProducts();
    const product = products.find((p) => p.slug === slug);
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

    // Get current product
    const products = await getAllProducts();
    const existing = products.find((p) => p.slug === slug);
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Merge updates
    const updated: StoredProduct = {
      ...existing,
      ...parsed.data,
      images: parsed.data.images ?? existing.images,
      updatedAt: new Date().toISOString(),
    };

    const ok = await saveProduct(updated);
    if (!ok) {
      return NextResponse.json(
        { error: "Failed to update product (GitHub commit failed)" },
        { status: 500 }
      );
    }

    return NextResponse.json({ product: updated });
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
    const ok = await deleteProduct(slug);
    if (!ok) {
      return NextResponse.json(
        { error: "Product not found or delete failed" },
        { status: 404 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/products/[slug] error", err);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
