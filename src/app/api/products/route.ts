import { NextRequest, NextResponse } from "next/server";
import {
  getAllProducts,
  saveProduct,
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

// Helper — checks if the current request is from a logged-in admin
async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("tikocraft-admin-session");
  if (!token?.value) return null;
  const { email, valid } = verifySessionToken(token.value);
  if (!valid || !email) return null;
  // For GitHub-backed admin, we just need the email to match
  return { email, name: "Admin", role: "owner" };
}

// ============================================================
// GET /api/products — list products (public + admin)
//   Query params: ?published=false (admin only — includes unpublished)
// ============================================================
export async function GET(req: NextRequest) {
  try {
    // Rate limit
    const ip = getClientIp(req);
    const rl = checkRateLimit(`products:get:${ip}`, RATE_LIMITS.read);
    if (rl.blocked) {
      return NextResponse.json({ error: "Rate limited" }, { status: 429 });
    }

    const { searchParams } = new URL(req.url);
    const includeUnpublished = searchParams.get("published") === "false";

    const allProducts = await getAllProducts();

    // If admin requesting unpublished, return all
    if (includeUnpublished) {
      const admin = await requireAdmin();
      if (!admin) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }
    }

    const filtered = includeUnpublished
      ? allProducts
      : allProducts.filter((p) => p.isPublished);

    // Sort by sortOrder then createdAt desc
    const sorted = [...filtered].sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json({ products: sorted });
  } catch (err) {
    console.error("GET /api/products error", err);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// ============================================================
// POST /api/products — create product (admin only)
// ============================================================

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Unauthorized — admin login required" },
      { status: 401 }
    );
  }

  // Rate limit
  const ip = getClientIp(req);
  const rl = checkRateLimit(`products:post:${ip}`, RATE_LIMITS.admin);
  if (rl.blocked) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  try {
    const body = await req.json();

    // Sanitize all inputs
    const name = sanitizeString(body?.name, 200);
    const slug = sanitizeSlug(body?.slug);
    const categorySlug = sanitizeSlug(body?.categorySlug);
    const description = sanitizeString(body?.description, 5000);
    const priceUSD = sanitizeNumber(body?.priceUSD, 0.01, 100000);
    const tag = body?.tag ? sanitizeString(body?.tag, 50) : null;
    const image = sanitizeUrl(body?.image);
    const images = sanitizeStringArray(body?.images);
    const videoUrl = body?.videoUrl ? sanitizeUrl(body?.videoUrl) : null;
    const material = body?.material ? sanitizeString(body?.material, 200) : null;
    const dimensions = body?.dimensions ? sanitizeString(body?.dimensions, 200) : null;
    const isPublished = sanitizeBoolean(body?.isPublished);
    const sortOrder = sanitizeNumber(body?.sortOrder, 0, 9999);

    // Validate required fields
    if (!name || !slug || !categorySlug || !description || !image) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (priceUSD <= 0) {
      return NextResponse.json(
        { error: "Price must be greater than 0" },
        { status: 400 }
      );
    }

    // Check slug uniqueness
    const existing = await getAllProducts();
    if (existing.find((p) => p.slug === slug)) {
      return NextResponse.json(
        { error: "A product with this slug already exists" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const product: StoredProduct = {
      id: `prod_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name,
      slug,
      categorySlug,
      description,
      priceUSD,
      tag,
      isPublished,
      sortOrder,
      image,
      images: images.length > 0 ? images : [image],
      videoUrl,
      material,
      dimensions,
      createdAt: now,
      updatedAt: now,
    };

    const ok = await saveProduct(product);
    if (!ok) {
      return NextResponse.json(
        { error: "Failed to save product (GitHub commit failed)" },
        { status: 500 }
      );
    }

    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    console.error("POST /api/products error", err);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
