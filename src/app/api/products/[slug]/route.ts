import { NextRequest, NextResponse } from "next/server";
import {
  getAllProducts,
  saveProduct,
  deleteProduct,
  type StoredProduct,
} from "@/lib/github-db";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/security";
import {
  sanitizeString,
  sanitizeSlug,
  sanitizeNumber,
  sanitizeUrl,
  sanitizeStringArray,
  sanitizeBoolean,
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

  // Rate limit
  const ip = getClientIp(req);
  const rl = checkRateLimit(`products:patch:${ip}`, RATE_LIMITS.admin);
  if (rl.blocked) return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  try {
    const { slug } = await params;
    const body = await req.json();

    // Get current product
    const products = await getAllProducts();
    const existing = products.find((p) => p.slug === slug);
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Sanitize only provided fields (partial update)
    const updated: StoredProduct = {
      ...existing,
      name: body.name !== undefined ? sanitizeString(body.name, 200) : existing.name,
      slug: body.slug !== undefined ? sanitizeSlug(body.slug) : existing.slug,
      categorySlug: body.categorySlug !== undefined ? sanitizeSlug(body.categorySlug) : existing.categorySlug,
      description: body.description !== undefined ? sanitizeString(body.description, 5000) : existing.description,
      priceUSD: body.priceUSD !== undefined ? sanitizeNumber(body.priceUSD, 0.01, 100000) : existing.priceUSD,
      tag: body.tag !== undefined ? (body.tag ? sanitizeString(body.tag, 50) : null) : existing.tag,
      image: body.image !== undefined ? sanitizeUrl(body.image) : existing.image,
      images: body.images !== undefined ? sanitizeStringArray(body.images) : existing.images,
      videoUrl: body.videoUrl !== undefined ? (body.videoUrl ? sanitizeUrl(body.videoUrl) : null) : existing.videoUrl,
      material: body.material !== undefined ? (body.material ? sanitizeString(body.material, 200) : null) : existing.material,
      dimensions: body.dimensions !== undefined ? (body.dimensions ? sanitizeString(body.dimensions, 200) : null) : existing.dimensions,
      isPublished: body.isPublished !== undefined ? sanitizeBoolean(body.isPublished) : existing.isPublished,
      sortOrder: body.sortOrder !== undefined ? sanitizeNumber(body.sortOrder, 0, 9999) : existing.sortOrder,
      updatedAt: new Date().toISOString(),
    };

    const ok = await saveProduct(updated);
    if (!ok) {
      return NextResponse.json(
        { error: "Failed to update product" },
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
