// ============================================================
// Shared seed data — imported by both lib/seed.ts (SQLite fallback)
// and lib/github-db.ts (GitHub-backed persistence).
// ============================================================

export const ADMIN_EMAIL = "tikocraft.com@gmail.com";
export const ADMIN_PASSWORD = "147Aa1471:/";

export interface SeedCategory {
  slug: string;
  name: string;
  subtitle: string | null;
  description: string | null;
  image: string | null;
  categoryType: "decor" | "booknook";
  sortOrder: number;
}

export interface SeedProduct {
  name: string;
  slug: string;
  categorySlug: string;
  description: string;
  priceUSD: number;
  tag: string | null;
  image: string;
  images: string[];
  videoUrl: string | null;
  material: string | null;
  dimensions: string | null;
  sortOrder: number;
}

export const SEED_CATEGORIES: SeedCategory[] = [
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
      "Oak, walnut and ash joined by hand — no metal, no shortcuts. Furniture built to outlive trend cycles and to carry the patina of a life well-used.",
    image: "/images/collection-furniture.png",
    categoryType: "decor",
    sortOrder: 4,
  },
  {
    slug: "book-nooks",
    name: "3D DIY Book Nooks",
    subtitle: "Worlds Between Books",
    description:
      "Hand-cut wooden kits that assemble into miniature worlds — a Parisian alley, an enchanted forest, a tiny library. Slotted between books on a shelf, they glow.",
    image: "/images/collection-booknooks.png",
    categoryType: "booknook",
    sortOrder: 5,
  },
];

export const SEED_PRODUCTS: SeedProduct[] = [
  {
    name: "Terracotta Vessel No. 04",
    slug: "terracotta-vessel-04",
    categorySlug: "ceramics",
    description:
      "Wheel-thrown terracotta with a soft matte glaze. Each vessel is unique in proportion and surface.",
    priceUSD: 186,
    tag: "New",
    image: "/images/product-1.png",
    images: [
      "/images/product-1.png",
      "/images/atelier-1.png",
      "/images/collection-ceramics.png",
    ],
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
    images: ["/images/product-2.png", "/images/collection-textiles.png"],
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
    images: ["/images/product-3.png", "/images/collection-furniture.png"],
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
    images: ["/images/product-4.png", "/images/texture-1.png"],
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
    images: ["/images/product-5.png", "/images/collection-lighting.png"],
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
    images: ["/images/product-6.png", "/images/collection-ceramics.png"],
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
      "A hand-cut diorama of a Parisian street at dusk. 84 pieces, warm LED, 8 hours to assemble.",
    priceUSD: 142,
    tag: "Bestseller",
    image: "/images/booknook-1.png",
    images: ["/images/booknook-1.png", "/images/booknook-hero.png", "/images/booknook-process.png"],
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
      "A miniature forest with fairy lights and hand-painted mushrooms. 102 pieces, warm LED included.",
    priceUSD: 158,
    tag: "New",
    image: "/images/booknook-2.png",
    images: ["/images/booknook-2.png", "/images/booknook-hero.png"],
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
    images: ["/images/booknook-3.png", "/images/booknook-hero.png"],
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
    images: ["/images/booknook-4.png", "/images/booknook-hero.png"],
    videoUrl: null,
    material: "Birch plywood, LED, paint",
    dimensions: "21 × 11 × 30 cm",
    sortOrder: 10,
  },
];
