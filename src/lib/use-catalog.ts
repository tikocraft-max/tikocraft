"use client";

import { useState, useEffect } from "react";

// ============================================================
// Types matching the /api/catalog response
// ============================================================
export interface CatalogCategory {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  image: string | null;
  items: string;
  category: "decor" | "booknook";
}

export interface CatalogProduct {
  id: string;
  name: string;
  slug: string;
  category: string;
  categorySlug: string;
  categoryType: "decor" | "booknook";
  price: number; // USD
  priceUSD: number;
  image: string;
  description: string;
  tag: string | null;
  material: string | null;
  dimensions: string | null;
}

interface CatalogData {
  categories: CatalogCategory[];
  products: CatalogProduct[];
}

// Static fallback — used if the API call fails (e.g. during build)
import { collections as fallbackCollections, products as fallbackProducts } from "./content";

const fallbackData: CatalogData = {
  categories: fallbackCollections.map((c) => ({
    id: c.id,
    slug: c.id,
    title: c.title,
    subtitle: c.subtitle,
    description: c.description,
    image: c.image,
    items: c.items,
    category: c.category,
  })),
  products: fallbackProducts.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.id,
    category: p.category,
    categorySlug: p.categoryType === "booknook" ? "book-nooks" : p.category.toLowerCase(),
    categoryType: p.categoryType,
    price: Number(p.price.replace(/[^0-9.]/g, "")),
    priceUSD: Number(p.price.replace(/[^0-9.]/g, "")),
    image: p.image,
    description: p.description,
    tag: p.tag ?? null,
    material: null,
    dimensions: null,
  })),
};

export function useCatalog() {
  const [data, setData] = useState<CatalogData>(fallbackData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/catalog", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: CatalogData) => {
        if (cancelled) return;
        if (d?.categories && d?.products) {
          setData(d);
        }
      })
      .catch(() => {
        // Use fallback on error
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { ...data, loading };
}
