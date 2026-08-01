// ============================================================
// GitHub-backed persistence layer
//
// Uses the GitHub repo itself as a database. Product + category
// data is stored in JSON files committed to the repo. Admin
// changes (create/update/delete) are persisted by committing
// updated JSON via the GitHub API.
//
// This works on Vercel serverless (no DB needed) and changes
// are permanent — they survive cold starts forever.
//
// Files:
//   data/products.json   — array of products
//   data/categories.json — array of categories
// ============================================================

// GitHub token must come from env var — never hardcoded.
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const REPO_OWNER = "tikocraft-max";
const REPO_NAME = "tikocraft";
const BRANCH = "main";

const PRODUCTS_FILE = "data/products.json";
const CATEGORIES_FILE = "data/categories.json";
const ADMIN_FILE = "data/admin.json";

const GITHUB_API = "https://api.github.com/repos";

// ============================================================
// Types
// ============================================================

export interface StoredProduct {
  id: string;
  name: string;
  slug: string;
  categorySlug: string;
  description: string;
  priceUSD: number;
  tag: string | null;
  isPublished: boolean;
  sortOrder: number;
  image: string;
  images: string[];
  videoUrl: string | null;
  material: string | null;
  dimensions: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StoredCategory {
  id: string;
  slug: string;
  name: string;
  subtitle: string | null;
  description: string | null;
  image: string | null;
  categoryType: "decor" | "booknook";
  sortOrder: number;
}

export interface StoredAdmin {
  email: string;
  name: string;
  password: string; // bcrypt hash
  role: string;
}

// ============================================================
// GitHub API helpers
// ============================================================

interface GitHubFile {
  content: string; // base64
  sha: string;
  path: string;
}

async function getFile(path: string): Promise<GitHubFile | null> {
  try {
    // Use cache-busting timestamp to always get fresh data from GitHub API
    const res = await fetch(
      `${GITHUB_API}/${REPO_OWNER}/${REPO_NAME}/contents/${path}?ref=${BRANCH}&t=${Date.now()}`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
          "Cache-Control": "no-cache",
        },
        cache: "no-store",
      }
    );
    if (!res.ok) {
      if (res.status === 404) return null;
      // Don't leak internal error details
      console.error(`[github] getFile(${path}) failed: ${res.status}`);
      return null;
    }
    const data = await res.json();
    const content = (data.content || "").replace(/\n/g, "");
    return { content, sha: data.sha, path: data.path };
  } catch (err) {
    console.error(`[github] getFile(${path}) error`);
    return null;
  }
}

async function putFile(
  path: string,
  content: string,
  sha: string | undefined,
  message: string
): Promise<boolean> {
  try {
    const res = await fetch(
      `${GITHUB_API}/${REPO_OWNER}/${REPO_NAME}/contents/${path}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          content: Buffer.from(content, "utf-8").toString("base64"),
          sha,
          branch: BRANCH,
        }),
      }
    );
    if (!res.ok) {
      const errBody = await res.text();
      console.error(`[github] putFile(${path}) failed ${res.status}:`, errBody);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[github] putFile(${path}) error:`, err);
    return false;
  }
}

// ============================================================
// Product operations
// ============================================================

export async function getAllProducts(): Promise<StoredProduct[]> {
  const file = await getFile(PRODUCTS_FILE);
  if (!file) return [];
  try {
    const decoded = Buffer.from(file.content, "base64").toString("utf-8");
    const products = JSON.parse(decoded);
    if (!Array.isArray(products)) return [];
    return products;
  } catch {
    return [];
  }
}

export async function getProductBySlug(
  slug: string
): Promise<StoredProduct | null> {
  const products = await getAllProducts();
  return products.find((p) => p.slug === slug) || null;
}

export async function saveProduct(
  product: StoredProduct
): Promise<boolean> {
  const products = await getAllProducts();
  const idx = products.findIndex((p) => p.slug === product.slug);
  if (idx >= 0) {
    products[idx] = { ...product, updatedAt: new Date().toISOString() };
  } else {
    products.push({ ...product, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  return await commitProducts(products, `update product: ${product.name}`);
}

export async function deleteProduct(slug: string): Promise<boolean> {
  const products = await getAllProducts();
  const filtered = products.filter((p) => p.slug !== slug);
  if (filtered.length === products.length) return false; // not found
  return await commitProducts(filtered, `delete product: ${slug}`);
}

async function commitProducts(
  products: StoredProduct[],
  message: string
): Promise<boolean> {
  const file = await getFile(PRODUCTS_FILE);
  const content = JSON.stringify(products, null, 2);
  return await putFile(PRODUCTS_FILE, content, file?.sha, message);
}

// ============================================================
// Category operations
// ============================================================

export async function getAllCategories(): Promise<StoredCategory[]> {
  const file = await getFile(CATEGORIES_FILE);
  if (!file) return [];
  try {
    const decoded = Buffer.from(file.content, "base64").toString("utf-8");
    const categories = JSON.parse(decoded);
    if (!Array.isArray(categories)) return [];
    return categories;
  } catch {
    return [];
  }
}

export async function saveCategory(
  category: StoredCategory
): Promise<boolean> {
  const categories = await getAllCategories();
  const idx = categories.findIndex((c) => c.slug === category.slug);
  if (idx >= 0) {
    categories[idx] = category;
  } else {
    categories.push(category);
  }
  return await commitCategories(categories, `update category: ${category.name}`);
}

export async function deleteCategory(slug: string): Promise<boolean> {
  const categories = await getAllCategories();
  const filtered = categories.filter((c) => c.slug !== slug);
  if (filtered.length === categories.length) return false;
  return await commitCategories(filtered, `delete category: ${slug}`);
}

async function commitCategories(
  categories: StoredCategory[],
  message: string
): Promise<boolean> {
  const file = await getFile(CATEGORIES_FILE);
  const content = JSON.stringify(categories, null, 2);
  return await putFile(CATEGORIES_FILE, content, file?.sha, message);
}

// ============================================================
// Admin operations
// ============================================================

export async function getAdmin(): Promise<StoredAdmin | null> {
  const file = await getFile(ADMIN_FILE);
  if (!file) return null;
  try {
    const decoded = Buffer.from(file.content, "base64").toString("utf-8");
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export async function saveAdmin(admin: StoredAdmin): Promise<boolean> {
  const file = await getFile(ADMIN_FILE);
  const content = JSON.stringify(admin, null, 2);
  return await putFile(ADMIN_FILE, content, file?.sha, "update admin user");
}

// ============================================================
// Initialize — seed the data files on first run
// ============================================================

import { SEED_CATEGORIES, SEED_PRODUCTS, ADMIN_EMAIL, ADMIN_PASSWORD } from "./seed-data";
import bcrypt from "bcryptjs";

let initialized = false;

export async function ensureGitHubSeeded(): Promise<void> {
  if (initialized) return;

  // Check if products file exists
  const productsFile = await getFile(PRODUCTS_FILE);
  if (!productsFile) {
    // Seed products
    const now = new Date().toISOString();
    const products: StoredProduct[] = SEED_PRODUCTS.map((p) => ({
      ...p,
      images: p.images || [p.image],
      videoUrl: p.videoUrl || null,
      tag: p.tag ?? null,
      material: p.material ?? null,
      dimensions: p.dimensions ?? null,
      isPublished: true,
      id: `seed_${p.slug}`,
      createdAt: now,
      updatedAt: now,
    }));
    await commitProducts(products, "seed: initial products");
    console.log("[github] Seeded products");
  }

  // Check if categories file exists
  const categoriesFile = await getFile(CATEGORIES_FILE);
  if (!categoriesFile) {
    const categories: StoredCategory[] = SEED_CATEGORIES.map((c) => ({
      ...c,
      id: `seed_${c.slug}`,
      subtitle: c.subtitle ?? null,
      description: c.description ?? null,
      image: c.image ?? null,
    }));
    await commitCategories(categories, "seed: initial categories");
    console.log("[github] Seeded categories");
  }

  // Check if admin file exists
  const adminFile = await getFile(ADMIN_FILE);
  if (!adminFile) {
    const hashed = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await saveAdmin({
      email: ADMIN_EMAIL,
      name: "Tikocraft Owner",
      password: hashed,
      role: "owner",
    });
    console.log("[github] Seeded admin user");
  }

  initialized = true;
}
