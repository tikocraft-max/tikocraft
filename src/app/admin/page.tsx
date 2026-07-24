"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter as useNextRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut,
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  Package,
  FolderTree,
  Eye,
  EyeOff,
  Save,
  Search,
  ExternalLink,
  Star,
} from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { toast } from "sonner";

// ============================================================
// Types
// ============================================================
interface Category {
  id: string;
  slug: string;
  name: string;
  subtitle: string | null;
  description: string | null;
  image: string | null;
  categoryType: string;
  sortOrder: number;
  _count?: { products: number };
}

interface Product {
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
  images: string | null; // JSON string of array
  videoUrl: string | null;
  material: string | null;
  dimensions: string | null;
  category?: Category;
}

interface AdminUser {
  email: string;
  name: string | null;
  role: string;
}

type Tab = "products" | "categories";

// ============================================================
// Page
// ============================================================
export default function AdminDashboard() {
  const router = useNextRouter();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [tab, setTab] = useState<Tab>("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  // ---- Auth check on mount ----
  useEffect(() => {
    fetch("/api/auth/session", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (!data?.admin) {
          router.replace("/admin/login");
        } else {
          setAdmin(data.admin);
          setAuthChecked(true);
        }
      })
      .catch(() => router.replace("/admin/login"));
  }, [router]);

  // ---- Fetch data ----
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products?published=false", { cache: "no-store" });
      const data = await res.json();
      setProducts(data.products || []);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories", { cache: "no-store" });
      const data = await res.json();
      setCategories(data.categories || []);
    } catch {
      toast.error("Failed to load categories");
    }
  }, []);

  useEffect(() => {
    if (authChecked) {
      loadProducts();
      loadCategories();
    }
  }, [authChecked, loadProducts, loadCategories]);

  // ---- Auth ----
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  };

  // ---- Product CRUD ----
  const handleSaveProduct = async (data: Partial<Product>, isNew: boolean) => {
    try {
      const url = isNew
        ? "/api/products"
        : `/api/products/${editing?.slug}`;
      const method = isNew ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Save failed");
        return;
      }
      toast.success(isNew ? "Product created" : "Product updated");
      setEditing(null);
      setCreating(false);
      loadProducts();
      loadCategories();
    } catch {
      toast.error("Network error");
    }
  };

  const handleDeleteProduct = async (slug: string) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/products/${slug}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Delete failed");
        return;
      }
      toast.success("Product deleted");
      loadProducts();
      loadCategories();
    } catch {
      toast.error("Network error");
    }
  };

  const handleTogglePublish = async (product: Product) => {
    try {
      const res = await fetch(`/api/products/${product.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !product.isPublished }),
      });
      if (!res.ok) {
        toast.error("Failed to update");
        return;
      }
      toast.success(product.isPublished ? "Unpublished" : "Published");
      loadProducts();
    } catch {
      toast.error("Network error");
    }
  };

  // ---- Category CRUD ----
  const handleSaveCategory = async (data: Partial<Category>, isDelete = false) => {
    // unused but kept for symmetry
  };

  const handleDeleteCategory = async (slug: string) => {
    if (!confirm("Delete this category? It must be empty of products first.")) return;
    try {
      const res = await fetch(`/api/categories/${slug}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Delete failed");
        return;
      }
      toast.success("Category deleted");
      loadCategories();
    } catch {
      toast.error("Network error");
    }
  };

  // ---- Derived ----
  const filteredProducts = products.filter((p) => {
    const matchesCategory = filterCategory === "all" || p.categorySlug === filterCategory;
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // ---- Loading / not authed ----
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-brown-900 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-beige" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brown-50">
      {/* Header */}
      <header className="bg-brown-900 text-cream sticky top-0 z-30 grain-overlay">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/images/logo-cream.png" alt="Tikocraft" className="h-8 w-auto" />
            <div className="hidden sm:block">
              <div className="font-display text-lg leading-none">Tikocraft Admin</div>
              <div className="font-body text-[10px] tracking-luxe uppercase text-beige/60 mt-1">
                {admin?.email}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 font-body text-[11px] tracking-luxe-sm uppercase text-beige/80 hover:text-cream transition-colors"
            >
              View Store
              <ExternalLink className="h-3 w-3" />
            </a>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 font-body text-[11px] tracking-luxe-sm uppercase border border-beige/40 px-4 py-2 hover:bg-beige hover:text-brown-900 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
          <div className="flex items-center gap-2 border-b border-beige pb-2">
            <button
              onClick={() => setTab("products")}
              className={`inline-flex items-center gap-2 px-5 py-2.5 font-body text-[11px] tracking-luxe-sm uppercase transition-colors ${
                tab === "products"
                  ? "bg-brown-800 text-cream"
                  : "text-brown-700 hover:bg-brown-100"
              }`}
            >
              <Package className="h-3.5 w-3.5" />
              Products
              <span className="font-body text-[10px] opacity-70">({products.length})</span>
            </button>
            <button
              onClick={() => setTab("categories")}
              className={`inline-flex items-center gap-2 px-5 py-2.5 font-body text-[11px] tracking-luxe-sm uppercase transition-colors ${
                tab === "categories"
                  ? "bg-brown-800 text-cream"
                  : "text-brown-700 hover:bg-brown-100"
              }`}
            >
              <FolderTree className="h-3.5 w-3.5" />
              Categories
              <span className="font-body text-[10px] opacity-70">({categories.length})</span>
            </button>
          </div>

          {tab === "products" ? (
            <button
              onClick={() => setCreating(true)}
              className="inline-flex items-center gap-2 bg-brown-800 text-cream px-5 py-2.5 font-body text-[11px] tracking-luxe-sm uppercase hover:bg-brown-900 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              New Product
            </button>
          ) : (
            <button
              onClick={() => setShowCategoryForm(true)}
              className="inline-flex items-center gap-2 bg-brown-800 text-cream px-5 py-2.5 font-body text-[11px] tracking-luxe-sm uppercase hover:bg-brown-900 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              New Category
            </button>
          )}
        </div>

        {/* Products tab */}
        {tab === "products" && (
          <motion.div
            variants={staggerContainer(0.05, 0.05)}
            initial="hidden"
            animate="visible"
          >
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="flex items-center gap-2 bg-white border border-beige px-3 py-2 flex-1 min-w-[200px] max-w-sm">
                <Search className="h-3.5 w-3.5 text-brown-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products…"
                  className="flex-1 bg-transparent font-body text-sm text-brown-900 placeholder:text-brown-400 focus:outline-none"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-white border border-beige px-4 py-2 font-body text-sm text-brown-900 focus:outline-none focus:border-brown-700"
              >
                <option value="all">All categories</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Products table */}
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-brown-500" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white border border-beige p-16 text-center">
                <Package className="h-10 w-10 text-brown-300 mx-auto mb-4" />
                <p className="font-display text-2xl text-brown-900 mb-2">No products yet</p>
                <p className="font-body text-sm text-brown-600 mb-6">
                  Add your first product to start selling.
                </p>
                <button
                  onClick={() => setCreating(true)}
                  className="inline-flex items-center gap-2 bg-brown-800 text-cream px-5 py-2.5 font-body text-[11px] tracking-luxe-sm uppercase hover:bg-brown-900 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  New Product
                </button>
              </div>
            ) : (
              <div className="bg-white border border-beige overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-brown-50 border-b border-beige">
                      <tr>
                        <th className="text-left font-body text-[10px] tracking-luxe uppercase text-brown-600 px-4 py-3">Image</th>
                        <th className="text-left font-body text-[10px] tracking-luxe uppercase text-brown-600 px-4 py-3">Name</th>
                        <th className="text-left font-body text-[10px] tracking-luxe uppercase text-brown-600 px-4 py-3 hidden md:table-cell">Category</th>
                        <th className="text-left font-body text-[10px] tracking-luxe uppercase text-brown-600 px-4 py-3">Price (USD)</th>
                        <th className="text-left font-body text-[10px] tracking-luxe uppercase text-brown-600 px-4 py-3 hidden sm:table-cell">Status</th>
                        <th className="text-right font-body text-[10px] tracking-luxe uppercase text-brown-600 px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((p) => (
                        <tr key={p.id} className="border-b border-beige/60 last:border-0 hover:bg-brown-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <img src={p.image} alt={p.name} className="h-14 w-14 object-cover bg-beige-light" />
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-display text-base text-brown-900 leading-tight">{p.name}</div>
                            {p.tag && (
                              <span className="font-body text-[10px] tracking-luxe uppercase text-brown-500">{p.tag}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <span className="font-body text-sm text-brown-700">{p.category?.name || p.categorySlug}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-display text-base text-brown-800">${p.priceUSD.toFixed(2)}</span>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <button
                              onClick={() => handleTogglePublish(p)}
                              className={`inline-flex items-center gap-1.5 font-body text-[10px] tracking-luxe-sm uppercase px-2.5 py-1.5 border transition-colors ${
                                p.isPublished
                                  ? "bg-green-50 border-green-300 text-green-800 hover:bg-green-100"
                                  : "bg-brown-50 border-brown-300 text-brown-600 hover:bg-brown-100"
                              }`}
                            >
                              {p.isPublished ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                              {p.isPublished ? "Published" : "Hidden"}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={() => setEditing(p)}
                                className="p-2 text-brown-700 hover:bg-brown-100 transition-colors"
                                aria-label="Edit"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.slug)}
                                className="p-2 text-red-700 hover:bg-red-50 transition-colors"
                                aria-label="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Categories tab */}
        {tab === "categories" && (
          <motion.div
            variants={staggerContainer(0.05, 0.05)}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {categories.map((c) => (
              <motion.div
                key={c.id}
                variants={fadeUp}
                className="bg-white border border-beige overflow-hidden"
              >
                <div className="relative aspect-[16/10] bg-beige-light overflow-hidden">
                  {c.image ? (
                    <img src={c.image} alt={c.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <FolderTree className="h-8 w-8 text-brown-300" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className="font-body text-[10px] tracking-luxe uppercase bg-cream/90 text-brown-800 px-2.5 py-1">
                      {c._count?.products || 0} products
                    </span>
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className="font-body text-[10px] tracking-luxe uppercase bg-brown-800/90 text-cream px-2.5 py-1">
                      {c.categoryType}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="font-body text-[10px] tracking-luxe uppercase text-brown-500 mb-1">
                    {c.subtitle}
                  </div>
                  <h3 className="font-display text-xl text-brown-900 mb-2">{c.name}</h3>
                  <p className="font-body text-xs text-brown-600 line-clamp-2 mb-4 font-light leading-relaxed">
                    {c.description}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-beige">
                    <code className="font-mono text-[10px] text-brown-500">{c.slug}</code>
                    <button
                      onClick={() => handleDeleteCategory(c.slug)}
                      className="inline-flex items-center gap-1 font-body text-[10px] tracking-luxe-sm uppercase text-red-700 hover:text-red-900 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      {/* Product editor modal */}
      <AnimatePresence>
        {(editing || creating) && (
          <ProductForm
            product={editing}
            categories={categories}
            onClose={() => {
              setEditing(null);
              setCreating(false);
            }}
            onSave={handleSaveProduct}
          />
        )}
      </AnimatePresence>

      {/* Category form modal */}
      <AnimatePresence>
        {showCategoryForm && (
          <CategoryForm
            onClose={() => setShowCategoryForm(false)}
            onSaved={() => {
              setShowCategoryForm(false);
              loadCategories();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// Product form modal
// ============================================================
function ProductForm({
  product,
  categories,
  onClose,
  onSave,
}: {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSave: (data: Partial<Product>, isNew: boolean) => void;
}) {
  const isNew = !product;
  // Parse existing images from JSON string
  const existingImages: string[] = (() => {
    if (!product?.images) return [];
    try {
      const parsed = JSON.parse(product.images);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();

  const [form, setForm] = useState({
    name: product?.name || "",
    slug: product?.slug || "",
    categorySlug: product?.categorySlug || categories[0]?.slug || "",
    description: product?.description || "",
    priceUSD: product?.priceUSD || 0,
    tag: product?.tag || "",
    image: product?.image || "/images/product-1.png",
    images: existingImages, // array of image URLs
    videoUrl: product?.videoUrl || "",
    material: product?.material || "",
    dimensions: product?.dimensions || "",
    isPublished: product?.isPublished ?? true,
    sortOrder: product?.sortOrder ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.slug || !form.categorySlug || !form.description || !form.image) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSaving(true);
    await onSave(
      {
        ...form,
        priceUSD: Number(form.priceUSD),
        sortOrder: Number(form.sortOrder),
        tag: form.tag || null,
        material: form.material || null,
        dimensions: form.dimensions || null,
        images: form.images, // array — API converts to JSON
        videoUrl: form.videoUrl || null,
      },
      isNew
    );
    setSaving(false);
  };

  // Image gallery management
  const addImage = () => {
    const url = newImageUrl.trim();
    if (!url) return;
    if (form.images.includes(url)) {
      toast.error("This image is already in the gallery");
      return;
    }
    setForm((f) => ({ ...f, images: [...f.images, url] }));
    setNewImageUrl("");
  };

  const removeImage = (url: string) => {
    setForm((f) => ({ ...f, images: f.images.filter((i) => i !== url) }));
  };

  const setMainImage = (url: string) => {
    setForm((f) => ({ ...f, image: url }));
  };

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    setForm((f) => ({
      ...f,
      name,
      slug: isNew
        ? name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
        : f.slug,
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-brown-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: 20, filter: "blur(6px)" }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="bg-cream text-brown-900 w-full max-w-2xl my-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-cream border-b border-beige px-6 py-4 flex items-center justify-between z-10">
          <h2 className="font-display text-2xl text-brown-900">
            {isNew ? "New Product" : "Edit Product"}
          </h2>
          <button onClick={onClose} className="p-2 text-brown-600 hover:bg-brown-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Main image preview */}
          <div className="flex gap-4">
            <div className="w-24 h-24 bg-beige-light overflow-hidden shrink-0">
              <img src={form.image} alt="Preview" className="h-full w-full object-cover" />
            </div>
            <div className="flex-1">
              <Label>Main image path * (shown on cards + as default)</Label>
              <Input
                value={form.image}
                onChange={(v) => setForm({ ...form, image: v })}
                placeholder="/images/product-1.png"
              />
              <p className="font-body text-[10px] text-brown-500 mt-2 font-light">
                Use an image from /public/images/. This is the main photo shown on product cards and as the first image in the gallery.
              </p>
            </div>
          </div>

          {/* Additional image gallery */}
          <div>
            <Label>Additional gallery images (optional)</Label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addImage();
                  }
                }}
                placeholder="/images/product-1-detail.png or https://…"
                className="flex-1 bg-white border border-beige px-4 py-2.5 font-body text-sm text-brown-900 placeholder:text-brown-400 focus:outline-none focus:border-brown-700"
              />
              <button
                type="button"
                onClick={addImage}
                className="inline-flex items-center gap-1 bg-brown-800 text-cream px-4 py-2.5 font-body text-[11px] tracking-luxe-sm uppercase hover:bg-brown-900 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </button>
            </div>
            <p className="font-body text-[10px] text-brown-500 mb-3 font-light">
              Add multiple images to show in the product gallery. The main image (above) is automatically the first gallery image.
            </p>

            {/* Gallery thumbnails */}
            {form.images.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {/* Main image shown first */}
                <div className="relative aspect-square bg-beige-light overflow-hidden border-2 border-brown-800">
                  <img src={form.image} alt="Main" className="h-full w-full object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 bg-brown-800 text-cream text-[8px] tracking-luxe uppercase text-center py-0.5">
                    Main
                  </div>
                </div>
                {/* Additional images */}
                {form.images
                  .filter((img) => img !== form.image)
                  .map((img, i) => (
                    <div key={i} className="relative aspect-square bg-beige-light overflow-hidden group">
                      <img src={img} alt={`Gallery ${i + 1}`} className="h-full w-full object-cover" />
                      {/* Set as main button */}
                      <button
                        type="button"
                        onClick={() => setMainImage(img)}
                        className="absolute top-1 left-1 bg-cream/90 text-brown-800 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Set as main image"
                      >
                        <Star className="h-3 w-3" strokeWidth={1.5} />
                      </button>
                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => removeImage(img)}
                        className="absolute top-1 right-1 bg-red-600 text-cream p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove image"
                      >
                        <X className="h-3 w-3" strokeWidth={1.8} />
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Video URL */}
          <div>
            <Label>Video URL (optional — YouTube, Vimeo, or MP4)</Label>
            <Input
              value={form.videoUrl}
              onChange={(v) => setForm({ ...form, videoUrl: v })}
              placeholder="https://www.youtube.com/watch?v=…"
            />
            <p className="font-body text-[10px] text-brown-500 mt-2 font-light">
              Paste a YouTube, Vimeo, or direct MP4 link. A "Watch Video" button will appear on the product page.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Name *</Label>
              <Input value={form.name} onChange={handleNameChange} placeholder="Terracotta Vessel No. 04" />
            </div>
            <div>
              <Label>Slug *</Label>
              <Input value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} placeholder="terracotta-vessel-04" disabled={!isNew} />
            </div>
          </div>

          <div>
            <Label>Description *</Label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Wheel-thrown terracotta with a soft matte glaze…"
              rows={3}
              className="w-full bg-white border border-beige px-4 py-3 font-body text-sm text-brown-900 placeholder:text-brown-400 focus:outline-none focus:border-brown-700 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label>Category *</Label>
              <select
                value={form.categorySlug}
                onChange={(e) => setForm({ ...form, categorySlug: e.target.value })}
                className="w-full bg-white border border-beige px-4 py-3 font-body text-sm text-brown-900 focus:outline-none focus:border-brown-700"
              >
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Price (USD) *</Label>
              <Input
                type="number"
                value={form.priceUSD}
                onChange={(v) => setForm({ ...form, priceUSD: Number(v) })}
                placeholder="186"
              />
            </div>
            <div>
              <Label>Tag</Label>
              <select
                value={form.tag || ""}
                onChange={(e) => setForm({ ...form, tag: e.target.value })}
                className="w-full bg-white border border-beige px-4 py-3 font-body text-sm text-brown-900 focus:outline-none focus:border-brown-700"
              >
                <option value="">— None —</option>
                <option value="New">New</option>
                <option value="Limited">Limited</option>
                <option value="Signature">Signature</option>
                <option value="Bestseller">Bestseller</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Material</Label>
              <Input value={form.material} onChange={(v) => setForm({ ...form, material: v })} placeholder="Stoneware, matte glaze" />
            </div>
            <div>
              <Label>Dimensions</Label>
              <Input value={form.dimensions} onChange={(v) => setForm({ ...form, dimensions: v })} placeholder="Ø 18 × H 32 cm" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div>
              <Label>Sort order</Label>
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(v) => setForm({ ...form, sortOrder: Number(v) })}
                placeholder="0"
              />
            </div>
            <label className="flex items-center gap-3 cursor-pointer py-3">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                className="h-4 w-4 accent-brown-800"
              />
              <span className="font-body text-sm text-brown-900">Published (visible on store)</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-beige">
            <button
              type="button"
              onClick={onClose}
              className="font-body text-[11px] tracking-luxe-sm uppercase px-5 py-3 text-brown-700 hover:text-brown-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-brown-800 text-cream px-6 py-3 font-body text-[11px] tracking-luxe-sm uppercase hover:bg-brown-900 disabled:opacity-60 transition-colors"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {isNew ? "Create Product" : "Save Changes"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ============================================================
// Category form modal
// ============================================================
function CategoryForm({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    slug: "",
    name: "",
    subtitle: "",
    description: "",
    image: "/images/collection-ceramics.png",
    categoryType: "decor" as "decor" | "booknook",
    sortOrder: 0,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.slug || !form.name) {
      toast.error("Slug and name are required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          subtitle: form.subtitle || null,
          description: form.description || null,
          sortOrder: Number(form.sortOrder),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Save failed");
        setSaving(false);
        return;
      }
      toast.success("Category created");
      onSaved();
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  };

  const handleNameChange = (name: string) => {
    setForm((f) => ({
      ...f,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-brown-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: 20, filter: "blur(6px)" }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="bg-cream text-brown-900 w-full max-w-xl my-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-cream border-b border-beige px-6 py-4 flex items-center justify-between z-10">
          <h2 className="font-display text-2xl text-brown-900">New Category</h2>
          <button onClick={onClose} className="p-2 text-brown-600 hover:bg-brown-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Name *</Label>
              <Input value={form.name} onChange={handleNameChange} placeholder="Ceramics & Vessels" />
            </div>
            <div>
              <Label>Slug *</Label>
              <Input value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} placeholder="ceramics" />
            </div>
          </div>

          <div>
            <Label>Subtitle</Label>
            <Input value={form.subtitle} onChange={(v) => setForm({ ...form, subtitle: v })} placeholder="Earth & Form" />
          </div>

          <div>
            <Label>Description</Label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Hand-thrown stoneware and porcelain…"
              className="w-full bg-white border border-beige px-4 py-3 font-body text-sm text-brown-900 placeholder:text-brown-400 focus:outline-none focus:border-brown-700 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Image path</Label>
              <Input value={form.image} onChange={(v) => setForm({ ...form, image: v })} placeholder="/images/collection-ceramics.png" />
            </div>
            <div>
              <Label>Type</Label>
              <select
                value={form.categoryType}
                onChange={(e) => setForm({ ...form, categoryType: e.target.value as "decor" | "booknook" })}
                className="w-full bg-white border border-beige px-4 py-3 font-body text-sm text-brown-900 focus:outline-none focus:border-brown-700"
              >
                <option value="decor">Handmade Decor</option>
                <option value="booknook">Book Nook</option>
              </select>
            </div>
          </div>

          <div>
            <Label>Sort order</Label>
            <Input
              type="number"
              value={form.sortOrder}
              onChange={(v) => setForm({ ...form, sortOrder: Number(v) })}
              placeholder="0"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-beige">
            <button
              type="button"
              onClick={onClose}
              className="font-body text-[11px] tracking-luxe-sm uppercase px-5 py-3 text-brown-700 hover:text-brown-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-brown-800 text-cream px-6 py-3 font-body text-[11px] tracking-luxe-sm uppercase hover:bg-brown-900 disabled:opacity-60 transition-colors"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Create Category
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ============================================================
// Small form primitives
// ============================================================
function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="font-body text-[10px] tracking-luxe uppercase text-brown-600 block mb-2">
      {children}
    </label>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
}: {
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full bg-white border border-beige px-4 py-3 font-body text-sm text-brown-900 placeholder:text-brown-400 focus:outline-none focus:border-brown-700 disabled:bg-brown-50 disabled:cursor-not-allowed"
    />
  );
}
