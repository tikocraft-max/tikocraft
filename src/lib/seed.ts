import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

// ============================================================
// Database schema + seed logic
//
// Extracted into a standalone module (NOT a route file) so it can be
// safely imported by API routes (login, catalog, products, etc.)
// without Next.js route-loader conflicts.
// ============================================================

// ============================================================
// Schema creation — for ephemeral SQLite on Vercel serverless
// ============================================================

const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AdminUser_email_key" UNIQUE ("email"),
    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "Category" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "image" TEXT,
    "categoryType" TEXT NOT NULL DEFAULT 'decor',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Category_slug_key" UNIQUE ("slug"),
    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "categorySlug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priceUSD" REAL NOT NULL,
    "tag" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "image" TEXT NOT NULL,
    "images" TEXT,
    "videoUrl" TEXT,
    "material" TEXT,
    "dimensions" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_slug_key" UNIQUE ("slug"),
    CONSTRAINT "Product_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Product_categorySlug_fkey" FOREIGN KEY ("categorySlug") REFERENCES "Category" ("slug") ON UPDATE NO ACTION ON DELETE RESTRICT
);
CREATE INDEX IF NOT EXISTS "Product_categorySlug_idx" ON "Product"("categorySlug");
CREATE TABLE IF NOT EXISTS "Order" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "totalAmount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "stripeSession" TEXT,
    "itemsJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);
`;

// For existing DBs that don't have the new images/videoUrl columns,
// add them via ALTER TABLE (idempotent — checks if column exists first)
async function addMissingColumns() {
  try {
    // Check if 'images' column exists
    const result = await db.$queryRawUnsafe(
      `SELECT name FROM pragma_table_info("Product") WHERE name IN ("images", "videoUrl")`
    ) as Array<{ name: string }>;
    const existing = result.map((r) => r.name);
    if (!existing.includes("images")) {
      await db.$executeRawUnsafe(`ALTER TABLE "Product" ADD COLUMN "images" TEXT`);
      console.log("[db] Added 'images' column to Product");
    }
    if (!existing.includes("videoUrl")) {
      await db.$executeRawUnsafe(`ALTER TABLE "Product" ADD COLUMN "videoUrl" TEXT`);
      console.log("[db] Added 'videoUrl' column to Product");
    }
  } catch (err) {
    // Column might already exist or table doesn't exist yet — ignore
  }
}

async function ensureSchemaExists(): Promise<boolean> {
  try {
    await db.category.count();
    // Schema exists — but add any missing columns (for upgrades)
    await addMissingColumns();
    return true;
  } catch {
    try {
      const statements = CREATE_TABLES_SQL.split(";").filter((s) => s.trim());
      for (const stmt of statements) {
        await db.$executeRawUnsafe(stmt);
      }
      console.log("[db] Schema created on cold start");
      return true;
    } catch (err) {
      console.error("[db] Schema creation failed:", err);
      return false;
    }
  }
}

// ============================================================
// Seed data
// ============================================================

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "tikocraft.com@gmail.com";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";

const SEED_CATEGORIES = [
  {
    slug: "ceramics",
    name: "Ceramics & Vessels",
    subtitle: "Earth & Form",
    description:
      "Hand-thrown stoneware and porcelain, finished in matte glazes drawn from river clays and mineral oxides. Each vessel carries the thumbprint of its maker.",
    image: "/images/collection-ceramics.png",
    categoryType: "decor",
    sortOrder: 1,
  },
  {
    slug: "textiles",
    name: "Textiles & Throws",
    subtitle: "Woven Warmth",
    description:
      "Natural fibers — linen, wool, hemp — dyed with plant pigments and woven on heritage looms. Slow textiles made to soften with every season of use.",
    image: "/images/collection-textiles.png",
    categoryType: "decor",
    sortOrder: 2,
  },
  {
    slug: "lighting",
    name: "Lighting & Ambiance",
    subtitle: "Quiet Light",
    description:
      "Cast bronze and beaten brass fixtures that hold candle and bulb in equal measure. Sculptural forms that shape the way a room breathes after dusk.",
    image: "/images/collection-lighting.png",
    categoryType: "decor",
    sortOrder: 3,
  },
  {
    slug: "furniture",
    name: "Furniture & Seating",
    subtitle: "Solid Ground",
    description:
      "Oak, walnut and ash, joined with care — built to outlive trend cycles and to carry the patina of a life well-used.",
    image: "/images/collection-furniture.png",
    categoryType: "decor",
    sortOrder: 4,
  },
  {
    slug: "book-nooks",
    name: "3D DIY Book Nooks",
    subtitle: "Worlds Between Books",
    description:
      "Wooden kits that assemble into miniature worlds — a Parisian alley, an enchanted forest, a tiny library. Slotted between books on a shelf, they glow.",
    image: "/images/collection-booknooks.png",
    categoryType: "booknook",
    sortOrder: 5,
  },
];

const SEED_PRODUCTS = [
  {
    name: "Terracotta Vessel No. 04",
    slug: "terracotta-vessel-04",
    categorySlug: "ceramics",
    description:
      "Wheel-thrown terracotta with a soft matte glaze. Each vessel is unique in proportion and surface.",
    priceUSD: 186,
    tag: "New",
    image: "/images/product-1.png",
    images: JSON.stringify([
      "/images/product-1.png",
      "/images/atelier-1.png",
      "/images/collection-ceramics.png",
    ]),
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    material: "Stoneware, matte glaze",
    dimensions: "Ø 18 × H 32 cm",
    sortOrder: 1,
  },
  {
    name: "Seagrass Carry Basket",
    slug: "seagrass-carry-basket",
    categorySlug: "textiles",
    description:
      "Hand-woven seagrass with vegetable-tanned leather handles. Made by a single artisan over three days.",
    priceUSD: 124,
    tag: null,
    image: "/images/product-2.png",
    images: JSON.stringify([
      "/images/product-2.png",
      "/images/collection-textiles.png",
    ]),
    videoUrl: null,
    material: "Seagrass, leather",
    dimensions: "Ø 32 × H 28 cm",
    sortOrder: 2,
  },
  {
    name: "Walnut Serving Bowl",
    slug: "walnut-serving-bowl",
    categorySlug: "furniture",
    description:
      "Carved from a single block of figured walnut, finished with food-safe linseed oil.",
    priceUSD: 248,
    tag: "Limited",
    image: "/images/product-3.png",
    images: JSON.stringify([
      "/images/product-3.png",
      "/images/collection-furniture.png",
    ]),
    videoUrl: null,
    material: "Figured walnut",
    dimensions: "Ø 30 × H 12 cm",
    sortOrder: 3,
  },
  {
    name: "Fringed Linen Throw",
    slug: "fringed-linen-throw",
    categorySlug: "textiles",
    description:
      "Stonewashed Belgian linen with hand-knotted fringe. Softens with every wash.",
    priceUSD: 168,
    tag: null,
    image: "/images/product-4.png",
    images: JSON.stringify([
      "/images/product-4.png",
      "/images/texture-1.png",
    ]),
    videoUrl: null,
    material: "Belgian linen",
    dimensions: "130 × 180 cm",
    sortOrder: 4,
  },
  {
    name: "Bronze Candleholder",
    slug: "bronze-candleholder",
    categorySlug: "lighting",
    description:
      "Sand-cast bronze with a living patina. Designed to age gracefully alongside its candle.",
    priceUSD: 215,
    tag: null,
    image: "/images/product-5.png",
    images: JSON.stringify([
      "/images/product-5.png",
      "/images/collection-lighting.png",
    ]),
    videoUrl: null,
    material: "Sand-cast bronze",
    dimensions: "Ø 10 × H 24 cm",
    sortOrder: 5,
  },
  {
    name: "Sculptural Form No. 02",
    slug: "sculptural-form-02",
    categorySlug: "ceramics",
    description:
      "Hand-built matte ceramic sculpture. A quiet object for the shelf or the entry table.",
    priceUSD: 320,
    tag: "Signature",
    image: "/images/product-6.png",
    images: JSON.stringify([
      "/images/product-6.png",
      "/images/collection-ceramics.png",
    ]),
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    material: "Hand-built ceramic",
    dimensions: "H 36 cm",
    sortOrder: 6,
  },
  {
    name: "Rue des Livres — Parisian Alley",
    slug: "rue-des-livres-parisian-alley",
    categorySlug: "book-nooks",
    description:
      "A diorama of a Parisian street at dusk. 84 pieces, warm LED, 8 hours to assemble.",
    priceUSD: 142,
    tag: "Bestseller",
    image: "/images/booknook-1.png",
    images: JSON.stringify([
      "/images/booknook-1.png",
      "/images/booknook-hero.png",
      "/images/booknook-process.png",
    ]),
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    material: "Birch plywood, LED, paint",
    dimensions: "21 × 11 × 30 cm",
    sortOrder: 7,
  },
  {
    name: "Sylvan Hollow — Enchanted Forest",
    slug: "sylvan-hollow-enchanted-forest",
    categorySlug: "book-nooks",
    description:
      "A miniature forest with fairy lights and painted mushrooms. 102 pieces, warm LED included.",
    priceUSD: 158,
    tag: "New",
    image: "/images/booknook-2.png",
    images: JSON.stringify([
      "/images/booknook-2.png",
      "/images/booknook-hero.png",
    ]),
    videoUrl: null,
    material: "Birch plywood, LED, paint",
    dimensions: "21 × 11 × 30 cm",
    sortOrder: 8,
  },
  {
    name: "The Reading Room — Tiny Library",
    slug: "the-reading-room-tiny-library",
    categorySlug: "book-nooks",
    description:
      "A miniature two-story library with rolling ladder and amber lamp light. 128 pieces.",
    priceUSD: 174,
    tag: "Limited",
    image: "/images/booknook-3.png",
    images: JSON.stringify([
      "/images/booknook-3.png",
      "/images/booknook-hero.png",
    ]),
    videoUrl: null,
    material: "Birch plywood, LED, paint",
    dimensions: "21 × 11 × 30 cm",
    sortOrder: 9,
  },
  {
    name: "Tsubaki-en — Zen Garden",
    slug: "tsubaki-en-zen-garden",
    categorySlug: "book-nooks",
    description:
      "A Japanese garden at twilight with stone lantern and cherry blossom. 96 pieces, warm LED.",
    priceUSD: 148,
    tag: null,
    image: "/images/booknook-4.png",
    images: JSON.stringify([
      "/images/booknook-4.png",
      "/images/booknook-hero.png",
    ]),
    videoUrl: null,
    material: "Birch plywood, LED, paint",
    dimensions: "21 × 11 × 30 cm",
    sortOrder: 10,
  },
];

// ============================================================
// ensureSeeded — exported for use by all API routes
// ============================================================

let seedChecked = false;

export async function ensureSeeded(): Promise<void> {
  if (seedChecked) return;
  try {
    const schemaOk = await ensureSchemaExists();
    if (!schemaOk) return;

    // Ensure admin user exists (separately from categories, so admin
    // is created even if categories already exist)
    const adminCount = await db.adminUser.count();
    if (adminCount === 0) {
      const hashed = await bcrypt.hash(ADMIN_PASSWORD, 12);
      await db.adminUser.upsert({
        where: { email: ADMIN_EMAIL },
        update: {},
        create: {
          email: ADMIN_EMAIL,
          name: "Tikocraft Owner",
          password: hashed,
          role: "owner",
        },
      });
      console.log("[db] Admin user created");
    }

    const catCount = await db.category.count();
    if (catCount === 0) {
      // DB is empty — seed categories + products
      for (const cat of SEED_CATEGORIES) {
        await db.category.upsert({
          where: { slug: cat.slug },
          update: {},
          create: cat,
        });
      }
      for (const p of SEED_PRODUCTS) {
        await db.product.upsert({
          where: { slug: p.slug },
          update: {},
          create: p,
        });
      }
      console.log("[db] Auto-seeded catalog");
    }

    seedChecked = true;
  } catch (err) {
    console.error("[db] Auto-seed failed:", err);
  }
}
