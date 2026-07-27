// ============================================================
// Tikocraft — Content data for collections, products, etc.
// ============================================================

export interface Collection {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  items: string;
  category: "decor" | "booknook";
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  image: string;
  description: string;
  tag?: string;
  categoryType: "decor" | "booknook";
}

export const collections: Collection[] = [
  {
    id: "ceramics",
    title: "Ceramics & Vessels",
    subtitle: "Earth & Form",
    description:
      "Hand-thrown stoneware and porcelain, finished in matte glazes drawn from river clays and mineral oxides. Each vessel carries the thumbprint of its maker.",
    image: "/images/collection-ceramics.png",
    items: "24 pieces",
    category: "decor",
  },
  {
    id: "textiles",
    title: "Textiles & Throws",
    subtitle: "Woven Warmth",
    description:
      "Natural fibers — linen, wool, hemp — dyed with plant pigments and woven on heritage looms. Slow textiles made to soften with every season of use.",
    image: "/images/collection-textiles.png",
    items: "18 pieces",
    category: "decor",
  },
  {
    id: "lighting",
    title: "Lighting & Ambiance",
    subtitle: "Quiet Light",
    description:
      "Cast bronze and beaten brass fixtures that hold candle and bulb in equal measure. Sculptural forms that shape the way a room breathes after dusk.",
    image: "/images/collection-lighting.png",
    items: "12 pieces",
    category: "decor",
  },
  {
    id: "furniture",
    title: "Furniture & Seating",
    subtitle: "Solid Ground",
    description:
      "Oak, walnut and ash joined by hand — no metal, no shortcuts. Furniture built to outlive trend cycles and to carry the patina of a life well-used.",
    image: "/images/collection-furniture.png",
    items: "9 pieces",
    category: "decor",
  },
  {
    id: "booknooks",
    title: "3D DIY Book Nooks",
    subtitle: "Worlds Between Books",
    description:
      "Hand-cut wooden kits that assemble into miniature worlds — a Parisian alley, an enchanted forest, a tiny library. Slotted between books on a shelf, they glow.",
    image: "/images/collection-booknooks.png",
    items: "12 kits",
    category: "booknook",
  },
];

export const products: Product[] = [
  {
    id: "p1",
    name: "Terracotta Vessel No. 04",
    category: "Ceramics",
    price: "$186",
    image: "/images/product-1.png",
    description:
      "Wheel-thrown terracotta with a soft matte glaze. Each vessel is unique in proportion and surface.",
    tag: "New",
    categoryType: "decor",
  },
  {
    id: "p2",
    name: "Seagrass Carry Basket",
    category: "Textiles",
    price: "$124",
    image: "/images/product-2.png",
    description:
      "Hand-woven seagrass with vegetable-tanned leather handles. Made by a single artisan over three days.",
    categoryType: "decor",
  },
  {
    id: "p3",
    name: "Walnut Serving Bowl",
    category: "Wood",
    price: "$248",
    image: "/images/product-3.png",
    description:
      "Carved from a single block of figured walnut, finished with food-safe linseed oil.",
    tag: "Limited",
    categoryType: "decor",
  },
  {
    id: "p4",
    name: "Fringed Linen Throw",
    category: "Textiles",
    price: "$168",
    image: "/images/product-4.png",
    description:
      "Stonewashed Belgian linen with hand-knotted fringe. Softens with every wash.",
    categoryType: "decor",
  },
  {
    id: "p5",
    name: "Bronze Candleholder",
    category: "Lighting",
    price: "$215",
    image: "/images/product-5.png",
    description:
      "Sand-cast bronze with a living patina. Designed to age gracefully alongside its candle.",
    categoryType: "decor",
  },
  {
    id: "p6",
    name: "Sculptural Form No. 02",
    category: "Objects",
    price: "$320",
    image: "/images/product-6.png",
    description:
      "Hand-built matte ceramic sculpture. A quiet object for the shelf or the entry table.",
    tag: "Signature",
    categoryType: "decor",
  },
  // 3D DIY Book Nooks
  {
    id: "bn1",
    name: "Rue des Livres — Parisian Alley",
    category: "Book Nook Kit",
    price: "$142",
    image: "/images/booknook-1.png",
    description:
      "A hand-cut diorama of a Parisian street at dusk. 84 pieces, warm LED, 8 hours to assemble.",
    tag: "Bestseller",
    categoryType: "booknook",
  },
  {
    id: "bn2",
    name: "Sylvan Hollow — Enchanted Forest",
    category: "Book Nook Kit",
    price: "$158",
    image: "/images/booknook-2.png",
    description:
      "A miniature forest with fairy lights and hand-painted mushrooms. 102 pieces, warm LED included.",
    tag: "New",
    categoryType: "booknook",
  },
  {
    id: "bn3",
    name: "The Reading Room — Tiny Library",
    category: "Book Nook Kit",
    price: "$174",
    image: "/images/booknook-3.png",
    description:
      "A miniature two-story library with rolling ladder and amber lamp light. 128 pieces.",
    tag: "Limited",
    categoryType: "booknook",
  },
  {
    id: "bn4",
    name: "Tsubaki-en — Zen Garden",
    category: "Book Nook Kit",
    price: "$148",
    image: "/images/booknook-4.png",
    description:
      "A Japanese garden at twilight with stone lantern and cherry blossom. 96 pieces, warm LED.",
    categoryType: "booknook",
  },
];

export interface NavItem {
  label: string;
  href: string;
  page: PageId;
}

export type PageId =
  | "home"
  | "collections"
  | "products"
  | "atelier"
  | "showroom"
  | "custom-clay"
  | "contact"
  | "product";

export const navItems: NavItem[] = [
  { label: "Home", href: "home", page: "home" },
  { label: "Collections", href: "collections", page: "collections" },
  { label: "Pieces", href: "products", page: "products" },
  { label: "Book Nooks", href: "booknooks", page: "products" },
  { label: "Atelier", href: "atelier", page: "atelier" },
  { label: "Custom Clay", href: "custom-clay", page: "custom-clay" },
  { label: "Contact", href: "contact", page: "contact" },
];

// Brand essence lines
export const brandLines = {
  tagline: "Handcrafted Home Decor & 3D DIY Book Nooks",
  hero: "Objects made slowly, to be lived with long.",
  essence:
    "A small atelier shaping earthy home objects and miniature worlds — one piece, one kit, at a time.",
};
