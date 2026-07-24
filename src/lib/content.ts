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
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  image: string;
  description: string;
  tag?: string;
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
  },
  {
    id: "textiles",
    title: "Textiles & Throws",
    subtitle: "Woven Warmth",
    description:
      "Natural fibers — linen, wool, hemp — dyed with plant pigments and woven on heritage looms. Slow textiles made to soften with every season of use.",
    image: "/images/collection-textiles.png",
    items: "18 pieces",
  },
  {
    id: "lighting",
    title: "Lighting & Ambiance",
    subtitle: "Quiet Light",
    description:
      "Cast bronze and beaten brass fixtures that hold candle and bulb in equal measure. Sculptural forms that shape the way a room breathes after dusk.",
    image: "/images/collection-lighting.png",
    items: "12 pieces",
  },
  {
    id: "furniture",
    title: "Furniture & Seating",
    subtitle: "Solid Ground",
    description:
      "Oak, walnut and ash joined by hand — no metal, no shortcuts. Furniture built to outlive trend cycles and to carry the patina of a life well-used.",
    image: "/images/collection-furniture.png",
    items: "9 pieces",
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
  },
  {
    id: "p2",
    name: "Seagrass Carry Basket",
    category: "Textiles",
    price: "$124",
    image: "/images/product-2.png",
    description:
      "Hand-woven seagrass with vegetable-tanned leather handles. Made by a single artisan over three days.",
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
  },
  {
    id: "p4",
    name: "Fringed Linen Throw",
    category: "Textiles",
    price: "$168",
    image: "/images/product-4.png",
    description:
      "Stonewashed Belgian linen with hand-knotted fringe. Softens with every wash.",
  },
  {
    id: "p5",
    name: "Bronze Candleholder",
    category: "Lighting",
    price: "$215",
    image: "/images/product-5.png",
    description:
      "Sand-cast bronze with a living patina. Designed to age gracefully alongside its candle.",
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
  },
];

export interface NavItem {
  label: string;
  href: string;
}

export const navItems: NavItem[] = [
  { label: "Home", href: "#home" },
  { label: "Collections", href: "#collections" },
  { label: "Pieces", href: "#products" },
  { label: "Atelier", href: "#atelier" },
  { label: "Showroom", href: "#showroom" },
  { label: "Contact", href: "#contact" },
];
