import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { z } from "zod";

// Helper — checks if the current request is from a logged-in admin
async function requireAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get("tikocraft-admin-session");
  const email = cookieStore.get("tikocraft-admin-email");
  if (!session?.value || !email?.value) {
    return null;
  }
  try {
    const admin = await db.adminUser.findUnique({
      where: { email: email.value },
      select: { email: true, name: true, role: true },
    });
    return admin;
  } catch {
    return null;
  }
}

// ============================================================
// GET /api/products — list products (public)
//   Query params: ?category=ceramics  &published=true
// ============================================================
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const publishedOnly = searchParams.get("published") !== "false";

    const products = await db.product.findMany({
      where: {
        ...(category ? { categorySlug: category } : {}),
        ...(publishedOnly ? { isPublished: true } : {}),
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: { category: true },
    });
    return NextResponse.json({ products });
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

    const product = await db.product.create({
      data: {
        ...parsed.data,
        tag: parsed.data.tag ?? null,
        material: parsed.data.material ?? null,
        dimensions: parsed.data.dimensions ?? null,
        isPublished: parsed.data.isPublished ?? true,
        sortOrder: parsed.data.sortOrder ?? 0,
      },
    });
    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    console.error("POST /api/products error", err);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
