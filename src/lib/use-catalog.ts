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
  images: string[]; // gallery images (includes main image as first)
  videoUrl: string | null; // optional video URL (YouTube/Vimeo/MP4)
  description: string;
  tag: string | null;
  material: string | null;
  dimensions: string | null;
}

interface CatalogData {
  categories: CatalogCategory[];
  products: CatalogProduct[];
}

// Empty initial state — show nothing until API loads.
// This prevents showing stale fallback data that doesn't match
// what's actually in the database.
const emptyData: CatalogData = {
  categories: [],
  products: [],
};

// ============================================================
// Global cache — shared across all useCatalog() calls within
// the same page. Prevents multiple API calls and ensures
// all components see the same data simultaneously.
// ============================================================
let globalCache: CatalogData | null = null;
let globalFetchPromise: Promise<CatalogData> | null = null;

async function fetchCatalog(): Promise<CatalogData> {
  if (globalCache) return globalCache;
  if (globalFetchPromise) return globalFetchPromise;

  globalFetchPromise = fetch("/api/catalog", { cache: "no-store" })
    .then((r) => r.json())
    .then((d: CatalogData) => {
      if (d?.categories && d?.products) {
        globalCache = d;
        return d;
      }
      return emptyData;
    })
    .catch(() => {
      return emptyData;
    })
    .finally(() => {
      globalFetchPromise = null;
    });

  return globalFetchPromise;
}

export function useCatalog() {
  // Start with cache if available, otherwise empty
  const [data, setData] = useState<CatalogData>(globalCache || emptyData);
  const [loading, setLoading] = useState(!globalCache);

  useEffect(() => {
    let cancelled = false;

    // If already cached, initial state already has the data — just ensure loading is false
    if (globalCache) {
      return;
    }

    fetchCatalog().then((d) => {
      if (cancelled) return;
      Promise.resolve().then(() => {
        setData(d);
        setLoading(false);
      });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { ...data, loading };
}

// Allow manual cache refresh (e.g., after admin changes)
export function refreshCatalog() {
  globalCache = null;
  globalFetchPromise = null;
}
