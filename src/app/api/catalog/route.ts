import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";

// GET /api/catalog — returns all published categories + products in one call
// Used by the public storefront
export async function GET() {
  try {
    await ensureSeeded();

    const [categories, products] = await Promise.all([
      db.category.findMany({
        where: { products: { some: { isPublished: true } } },
        orderBy: { sortOrder: "asc" },
        include: {
          _count: { select: { products: { where: { isPublished: true } } } },
        },
      }),
      db.product.findMany({
        where: { isPublished: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        include: { category: true },
      }),
    ]);

    return NextResponse.json({
      categories: categories.map((c) => ({
        id: c.id,
        slug: c.slug,
        title: c.name,
        subtitle: c.subtitle,
        description: c.description,
        image: c.image,
        items: `${c._count.products} ${c._count.products === 1 ? "piece" : "pieces"}`,
        category: c.categoryType as "decor" | "booknook",
      })),
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        category: p.category?.name || p.categorySlug,
        categorySlug: p.categorySlug,
        categoryType: p.category?.categoryType as "decor" | "booknook",
        price: p.priceUSD,
        priceUSD: p.priceUSD,
        image: p.image,
        description: p.description,
        tag: p.tag,
        material: p.material,
        dimensions: p.dimensions,
      })),
    });
  } catch (err) {
    console.error("GET /api/catalog error", err);
    return NextResponse.json(
      { error: "Failed to fetch catalog" },
      { status: 500 }
    );
  }
}
