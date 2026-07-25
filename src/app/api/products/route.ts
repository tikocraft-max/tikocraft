import { NextRequest, NextResponse } from "next/server";
import {
  getAllProducts,
  saveProduct,
  type StoredProduct,
} from "@/lib/github-db";
import { cookies } from "next/headers";
import { z } from "zod";
import { verifySessionToken } from "@/lib/security";

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
const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  categorySlug: z.string().min(1),
  description: z.string().min(1),
  priceUSD: z.number().positive(),
  tag: z.string().nullable().optional(),
  image: z.string().min(1),
  images: z.array(z.string()).nullable().optional(),
  videoUrl: z.string().nullable().optional(),
  material: z.string().nullable().optional(),
  dimensions: z.string().nullable().optional(),
  isPublished: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Unauthorized — admin login required" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid product data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Check slug uniqueness
    const existing = await getAllProducts();
    if (existing.find((p) => p.slug === parsed.data.slug)) {
      return NextResponse.json(
        { error: "A product with this slug already exists" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const product: StoredProduct = {
      id: `prod_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: parsed.data.name,
      slug: parsed.data.slug,
      categorySlug: parsed.data.categorySlug,
      description: parsed.data.description,
      priceUSD: parsed.data.priceUSD,
      tag: parsed.data.tag ?? null,
      isPublished: parsed.data.isPublished ?? true,
      sortOrder: parsed.data.sortOrder ?? 0,
      image: parsed.data.image,
      images: parsed.data.images || [parsed.data.image],
      videoUrl: parsed.data.videoUrl ?? null,
      material: parsed.data.material ?? null,
      dimensions: parsed.data.dimensions ?? null,
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
