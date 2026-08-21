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
    id: "book-nooks",
    title: "3D DIY Book Nooks",
    subtitle: "Worlds Between Books",
    description:
      "Wooden kits that assemble into miniature worlds — a Parisian alley, an enchanted forest, a tiny library. Slotted between books on a shelf, they glow.",
    image: "/images/collection-booknooks.png",
    items: "4 kits",
    category: "booknook",
  },
  {
    id: "3d-diy-miniature",
    title: "3D DIY Miniature",
    subtitle: "Build Your World",
    description:
      "Detailed miniature diorama kits you assemble yourself. Precision-cut pieces, warm LED lighting, and fine-painted details bring tiny scenes to life.",
    image: "/images/booknook-hero.png",
    items: "Coming soon",
    category: "booknook",
  },
  {
    id: "custom-figures",
    title: "Custom Figures",
    subtitle: "Sculpted From Your Photo",
    description:
      "Turn a photo into a sculpted clay figure. A unique gift for loved ones, a memorial keepsake, or a personal treasure. Each piece is made to order.",
    image: "/images/atelier-1.png",
    items: "Made to order",
    category: "booknook",
  },
];

export const products: Product[] = [
  {
    id: "bn1",
    name: "Rue des Livres — Parisian Alley",
    category: "Book Nook Kit",
    price: "$142",
    image: "/images/booknook-1.png",
    description:
      "A diorama of a Parisian street at dusk. 84 pieces, warm LED, 8 hours to assemble.",
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
      "A miniature forest with fairy lights and painted mushrooms. 102 pieces, warm LED included.",
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
  | "product"
  | "legal";

export const navItems: NavItem[] = [
  { label: "Home", href: "home", page: "home" },
  { label: "Collections", href: "collections", page: "collections" },
  { label: "Book Nooks", href: "booknooks", page: "products" },
  { label: "Atelier", href: "atelier", page: "atelier" },
  { label: "Custom Figures", href: "custom-clay", page: "custom-clay" },
  { label: "Contact", href: "contact", page: "contact" },
];

// Brand essence lines
export const brandLines = {
  tagline: "Home Decor & 3D DIY Book Nooks",
  hero: "Objects made slowly, to be lived with long.",
  essence:
    "A curated studio of earthy home objects and miniature worlds — sourced and shipped with intention.",
};
