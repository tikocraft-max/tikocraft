import { NextRequest, NextResponse } from "next/server";
import { getAllCategories, getAllProducts, saveCategory, deleteCategory, ensureGitHubSeeded, type StoredCategory } from "@/lib/github-db";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/security";
import { sanitizeString, sanitizeSlug, checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/sanitize";

// GET /api/categories — list all categories (public)
export async function GET(req: NextRequest) {
  // Rate limit
  const ip = getClientIp(req);
  const rl = checkRateLimit(`categories:get:${ip}`, RATE_LIMITS.read);
  if (rl.blocked) return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  try {
    await ensureGitHubSeeded();
    const [categories, products] = await Promise.all([
      getAllCategories(),
      getAllProducts(),
    ]);

    // Add product counts
    const withCounts = categories.map((c) => ({
      ...c,
      _count: { products: products.filter((p) => p.categorySlug === c.slug).length },
    }));

    const sorted = [...withCounts].sort((a, b) => a.sortOrder - b.sortOrder);
    return NextResponse.json({ categories: sorted });
  } catch (err) {
    console.error("GET /api/categories error", err);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("tikocraft-admin-session");
  if (!token?.value) return null;
  const { email, valid } = verifySessionToken(token.value);
  if (!valid || !email) return null;
  return { email, name: "Admin", role: "owner" };
}


// POST /api/categories — create category (admin only)
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
  const rl = checkRateLimit(`categories:post:${ip}`, RATE_LIMITS.admin);
  if (rl.blocked) return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  try {
    const body = await req.json();

    // Sanitize inputs
    const slug = sanitizeSlug(body?.slug);
    const name = sanitizeString(body?.name, 200);
    const subtitle = body?.subtitle ? sanitizeString(body?.subtitle, 200) : null;
    const description = body?.description ? sanitizeString(body?.description, 2000) : null;
    const image = body?.image ? sanitizeString(body?.image, 2000) : null;
    const categoryType = body?.categoryType === "decor" ? "decor" : "booknook";
    const sortOrder = Number(body?.sortOrder) || 0;

    if (!slug || !name) {
      return NextResponse.json(
        { error: "Slug and name are required" },
        { status: 400 }
      );
    }

    const category: StoredCategory = {
      id: `cat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      slug,
      name,
      subtitle,
      description,
      image,
      categoryType,
      sortOrder,
    };

    const ok = await saveCategory(category);
    if (!ok) {
      return NextResponse.json(
        { error: "Failed to save category (GitHub commit failed)" },
        { status: 500 }
      );
    }

    return NextResponse.json({ category }, { status: 201 });
  } catch (err) {
    console.error("POST /api/categories error", err);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
