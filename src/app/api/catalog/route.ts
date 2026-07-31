import { NextRequest, NextResponse } from "next/server";
import {
  getAllProducts,
  getAllCategories,
  ensureGitHubSeeded,
  type StoredProduct,
  type StoredCategory,
} from "@/lib/github-db";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/sanitize";

// GET /api/catalog — returns all published categories + products
export async function GET(req: NextRequest) {
  // Rate limit
  const ip = getClientIp(req);
  const rl = checkRateLimit(`catalog:${ip}`, RATE_LIMITS.read);
  if (rl.blocked) {
    return NextResponse.json(
      { error: "Rate limited" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  try {
    await ensureGitHubSeeded();

    const [categories, products] = await Promise.all([
      getAllCategories(),
      getAllProducts(),
    ]);

    // Build category lookup map
    const categoryMap = new Map(categories.map((c) => [c.slug, c]));

    // Map categories to public format
    const publicCategories = categories.map((c) => mapCategory(c, products));

    // Filter to published products only + resolve category info
    const publishedProducts = products
      .filter((p) => p.isPublished)
      .map((p) => mapProduct(p, categoryMap))
      .sort((a, b) => a.sortOrder - b.sortOrder);

    return NextResponse.json({
      categories: publicCategories,
      products: publishedProducts,
    });
  } catch (err) {
    console.error("GET /api/catalog error", err);
    return NextResponse.json(
      { error: "Failed to fetch catalog" },
      { status: 500 }
    );
  }
}

function mapCategory(c: StoredCategory, allProducts: StoredProduct[]) {
  const productCount = allProducts.filter(
    (p) => p.categorySlug === c.slug && p.isPublished
  ).length;
  return {
    id: c.id,
    slug: c.slug,
    title: c.name,
    subtitle: c.subtitle,
    description: c.description,
    image: c.image,
    items: `${productCount} ${productCount === 1 ? "piece" : "pieces"}`,
    category: c.categoryType as "decor" | "booknook",
  };
}

function mapProduct(
  p: StoredProduct,
  categoryMap: Map<string, StoredCategory>
) {
  const cat = categoryMap.get(p.categorySlug);
  const images = p.images && p.images.length > 0 ? p.images : [p.image];
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: cat?.name || p.categorySlug,
    categorySlug: p.categorySlug,
    categoryType: (cat?.categoryType || "decor") as "decor" | "booknook",
    price: p.priceUSD,
    priceUSD: p.priceUSD,
    image: p.image,
    images,
    videoUrl: p.videoUrl,
    description: p.description,
    tag: p.tag,
    material: p.material,
    dimensions: p.dimensions,
  };
}
