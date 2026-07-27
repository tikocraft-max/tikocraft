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

// ============================================================
// Only 3 categories — Book Nooks, 3D DIY Miniature, Custom Figures
// ============================================================
export const SEED_CATEGORIES: SeedCategory[] = [
  {
    slug: "book-nooks",
    name: "3D DIY Book Nooks",
    subtitle: "Worlds Between Books",
    description:
      "Hand-cut wooden kits that assemble into miniature worlds — a Parisian alley, an enchanted forest, a tiny library. Slotted between books on a shelf, they glow.",
    image: "/images/collection-booknooks.png",
    categoryType: "booknook",
    sortOrder: 1,
  },
  {
    slug: "3d-diy-miniature",
    name: "3D DIY Miniature",
    subtitle: "Build Your World",
    description:
      "Detailed miniature diorama kits you assemble yourself. Precision-cut pieces, warm LED lighting, and hand-painted details bring tiny scenes to life.",
    image: "/images/booknook-hero.png",
    categoryType: "booknook",
    sortOrder: 2,
  },
  {
    slug: "custom-figures",
    name: "Custom Figures",
    subtitle: "Sculpted From Your Photo",
    description:
      "Turn a photo into a hand-sculpted clay figure. A unique gift for loved ones, a memorial keepsake, or a personal treasure. Each piece is crafted by hand.",
    image: "/images/atelier-1.png",
    categoryType: "booknook",
    sortOrder: 3,
  },
];

// ============================================================
// Seed products — only Book Nooks (user can add more via admin)
// ============================================================
export const SEED_PRODUCTS: SeedProduct[] = [
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
    videoUrl: null,
    material: "Birch plywood, LED, paint",
    dimensions: "21 × 11 × 30 cm",
    sortOrder: 1,
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
    sortOrder: 2,
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
    sortOrder: 3,
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
    sortOrder: 4,
  },
];
