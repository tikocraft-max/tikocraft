"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  Minus,
  Upload,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { toast } from "sonner";
import { processImageFile } from "@/lib/image-upload";

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
  images: string[] | null; // array of image URLs (from GitHub DB)
  videoUrl: string | null;
  material: string | null;
  dimensions: string | null;
  createdAt?: string;
  updatedAt?: string;
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
                            <span className="price-num text-base text-brown-800">${p.priceUSD.toFixed(2)}</span>
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
// Product form modal — organized into clear sections with tabs
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
  const existingImages: string[] = Array.isArray(product?.images)
    ? product.images
    : [];

  const [form, setForm] = useState({
    name: product?.name || "",
    slug: product?.slug || "",
    categorySlug: product?.categorySlug || categories[0]?.slug || "",
    description: product?.description || "",
    priceUSD: product?.priceUSD || 0,
    tag: product?.tag || "",
    image: product?.image || "/images/product-1.png",
    images: existingImages,
    videoUrl: product?.videoUrl || "",
    material: product?.material || "",
    dimensions: product?.dimensions || "",
    isPublished: product?.isPublished ?? true,
    sortOrder: product?.sortOrder ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<"details" | "media" | "settings">("details");
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.slug || !form.categorySlug || !form.description || !form.image) {
      toast.error("Please fill in all required fields (name, slug, category, description, main photo)");
      setActiveTab("details");
      return;
    }
    if (form.priceUSD <= 0) {
      toast.error("Price must be greater than 0");
      setActiveTab("details");
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
        images: form.images,
        videoUrl: form.videoUrl || null,
      },
      isNew
    );
    setSaving(false);
  };

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
      className="fixed inset-0 z-50 bg-brown-900/70 backdrop-blur-sm flex items-start sm:items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: 20, filter: "blur(6px)" }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="bg-cream text-brown-900 w-full max-w-2xl my-4 max-h-[95vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-cream border-b border-beige px-6 py-4 flex items-center justify-between z-10 shrink-0">
          <div>
            <h2 className="font-display text-2xl text-brown-900 leading-tight">
              {isNew ? "New Product" : "Edit Product"}
            </h2>
            <p className="font-body text-[10px] tracking-luxe-sm uppercase text-brown-500 mt-1">
              {isNew ? "Fill in the details below" : "Update the product details"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-brown-600 hover:bg-brown-100 transition-colors shrink-0"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-beige bg-brown-50/50 shrink-0">
          {[
            { id: "details" as const, label: "1 · Details" },
            { id: "media" as const, label: "2 · Photos & Video" },
            { id: "settings" as const, label: "3 · Settings" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 font-body text-[11px] tracking-luxe-sm uppercase transition-colors border-b-2 ${
                activeTab === tab.id
                  ? "bg-cream text-brown-900 border-brown-800"
                  : "text-brown-500 hover:text-brown-700 border-transparent hover:bg-brown-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form body — scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* ============================================================
                TAB 1: DETAILS
                ============================================================ */}
            {activeTab === "details" && (
              <div className="space-y-5 animate-fade-in-up">
                <div className="bg-brown-50/60 border border-beige p-4">
                  <h3 className="font-display text-lg text-brown-900 mb-1">Product Information</h3>
                  <p className="font-body text-[11px] text-brown-500">
                    The name, description, and price customers will see.
                  </p>
                </div>

                <div>
                  <Label>Product Name *</Label>
                  <Input
                    value={form.name}
                    onChange={handleNameChange}
                    placeholder="e.g. Terracotta Vessel No. 04"
                  />
                </div>

                <div>
                  <Label>URL Slug * <span className="text-brown-400 normal-case tracking-normal">(auto-generated from name)</span></Label>
                  <Input
                    value={form.slug}
                    onChange={(v) => setForm({ ...form, slug: v })}
                    placeholder="terracotta-vessel-04"
                    disabled={!isNew}
                  />
                  <p className="font-body text-[10px] text-brown-500 mt-1.5 font-light">
                    Used in the product URL: /#product/<span className="font-mono">{form.slug || "your-slug"}</span>
                  </p>
                </div>

                <div>
                  <Label>Description *</Label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe the product — materials, story, what makes it special…"
                    rows={4}
                    className="w-full bg-white border border-beige px-4 py-3 font-body text-sm text-brown-900 placeholder:text-brown-400 focus:outline-none focus:border-brown-700 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-body text-sm text-brown-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.priceUSD}
                        onChange={(e) => setForm({ ...form, priceUSD: Number(e.target.value) })}
                        placeholder="186"
                        className="w-full bg-white border border-beige pl-7 pr-4 py-3 font-body text-sm text-brown-900 placeholder:text-brown-400 focus:outline-none focus:border-brown-700"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Tag <span className="text-brown-400 normal-case tracking-normal">(optional badge)</span></Label>
                  <div className="flex flex-wrap gap-2">
                    {["", "New", "Limited", "Signature", "Bestseller"].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setForm({ ...form, tag })}
                        className={`font-body text-[11px] tracking-luxe-sm uppercase px-4 py-2 border transition-all ${
                          (form.tag || "") === tag
                            ? "bg-brown-800 text-cream border-brown-800"
                            : "border-brown-300 text-brown-700 hover:border-brown-700 hover:bg-brown-50"
                        }`}
                      >
                        {tag || "None"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Material <span className="text-brown-400 normal-case tracking-normal">(optional)</span></Label>
                    <Input
                      value={form.material}
                      onChange={(v) => setForm({ ...form, material: v })}
                      placeholder="e.g. Stoneware, matte glaze"
                    />
                  </div>
                  <div>
                    <Label>Dimensions <span className="text-brown-400 normal-case tracking-normal">(optional)</span></Label>
                    <Input
                      value={form.dimensions}
                      onChange={(v) => setForm({ ...form, dimensions: v })}
                      placeholder="e.g. Ø 18 × H 32 cm"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("media")}
                    className="inline-flex items-center gap-2 bg-brown-800 text-cream px-6 py-3 font-body text-[11px] tracking-luxe-sm uppercase hover:bg-brown-900 transition-colors"
                  >
                    Next: Photos & Video
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ============================================================
                TAB 2: MEDIA (Photos + Video)
                ============================================================ */}
            {activeTab === "media" && (
              <div className="space-y-6 animate-fade-in-up">
                <div className="bg-brown-50/60 border border-beige p-4">
                  <h3 className="font-display text-lg text-brown-900 mb-1">Main Photo *</h3>
                  <p className="font-body text-[11px] text-brown-500">
                    Shown on product cards and as the first image in the gallery.
                  </p>
                </div>

                {/* Main photo */}
                <div className="flex gap-4 items-start">
                  <div className="w-28 h-28 bg-beige-light overflow-hidden shrink-0 border border-beige">
                    <img src={form.image} alt="Main preview" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <input
                      ref={mainImageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          setUploadingMain(true);
                          const dataUrl = await processImageFile(file);
                          setForm((f) => ({
                            ...f,
                            image: dataUrl,
                            images: f.images.includes(dataUrl) ? f.images : [...f.images, dataUrl],
                          }));
                          toast.success("Main photo uploaded");
                        } catch (err) {
                          toast.error(err instanceof Error ? err.message : "Upload failed");
                        } finally {
                          setUploadingMain(false);
                          if (mainImageInputRef.current) mainImageInputRef.current.value = "";
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => mainImageInputRef.current?.click()}
                      disabled={uploadingMain}
                      className="inline-flex items-center gap-2 bg-brown-800 text-cream px-4 py-2.5 font-body text-[11px] tracking-luxe-sm uppercase hover:bg-brown-900 disabled:opacity-60 transition-colors w-full justify-center"
                    >
                      {uploadingMain ? (
                        <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Processing…</>
                      ) : (
                        <><Upload className="h-3.5 w-3.5" /> Upload Main Photo</>
                      )}
                    </button>
                    <div className="flex items-center gap-2">
                      <span className="font-body text-[10px] text-brown-400 uppercase tracking-luxe-sm">or URL:</span>
                      <input
                        type="text"
                        value={form.image.startsWith("data:") ? "" : form.image}
                        onChange={(e) => setForm({ ...form, image: e.target.value })}
                        placeholder="/images/product-1.png"
                        disabled={form.image.startsWith("data:")}
                        className="flex-1 bg-white border border-beige px-3 py-2 font-body text-xs text-brown-900 placeholder:text-brown-400 focus:outline-none focus:border-brown-700 disabled:bg-brown-50 disabled:text-brown-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Gallery */}
                <div className="border-t border-beige pt-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-display text-lg text-brown-900">Gallery Images</h3>
                      <p className="font-body text-[11px] text-brown-500">
                        Additional photos shown in the product gallery. Hover to remove or set as main.
                      </p>
                    </div>
                  </div>

                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length === 0) return;
                      try {
                        setUploadingGallery(true);
                        const dataUrls = await Promise.all(files.map(processImageFile));
                        setForm((f) => ({
                          ...f,
                          images: [...f.images, ...dataUrls.filter((u) => !f.images.includes(u))],
                        }));
                        toast.success(`${files.length} image${files.length > 1 ? "s" : ""} added`);
                      } catch (err) {
                        toast.error(err instanceof Error ? err.message : "Upload failed");
                      } finally {
                        setUploadingGallery(false);
                        if (galleryInputRef.current) galleryInputRef.current.value = "";
                      }
                    }}
                  />

                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    <div className="relative aspect-square bg-beige-light overflow-hidden border-2 border-brown-800">
                      <img src={form.image} alt="Main" className="h-full w-full object-cover" />
                      <div className="absolute bottom-0 left-0 right-0 bg-brown-800 text-cream text-[8px] tracking-luxe uppercase text-center py-0.5">
                        Main
                      </div>
                    </div>

                    {form.images
                      .filter((img) => img !== form.image)
                      .map((img, i) => (
                        <div key={i} className="relative aspect-square bg-beige-light overflow-hidden group">
                          <img src={img} alt={`Gallery ${i + 1}`} className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setMainImage(img)}
                            className="absolute top-1 left-1 bg-cream/90 text-brown-800 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Set as main photo"
                          >
                            <Star className="h-3 w-3" strokeWidth={1.5} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeImage(img)}
                            className="absolute top-1 right-1 bg-red-600 text-cream p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove image"
                          >
                            <Minus className="h-3 w-3" strokeWidth={2} />
                          </button>
                        </div>
                      ))}

                    <button
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      disabled={uploadingGallery}
                      className="aspect-square border-2 border-dashed border-brown-300 hover:border-brown-700 hover:bg-brown-50 transition-colors flex items-center justify-center group disabled:opacity-60"
                      title="Add image"
                    >
                      {uploadingGallery ? (
                        <Loader2 className="h-5 w-5 text-brown-500 animate-spin" />
                      ) : (
                        <Plus className="h-6 w-6 text-brown-400 group-hover:text-brown-700 transition-colors" strokeWidth={1.5} />
                      )}
                    </button>
                  </div>

                  <div className="mt-3 flex gap-2">
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
                      placeholder="Or paste an image URL (https://… or /images/…)"
                      className="flex-1 bg-white border border-beige px-3 py-2 font-body text-xs text-brown-900 placeholder:text-brown-400 focus:outline-none focus:border-brown-700"
                    />
                    <button
                      type="button"
                      onClick={addImage}
                      className="inline-flex items-center gap-1 border border-brown-300 text-brown-700 px-3 py-2 font-body text-[10px] tracking-luxe-sm uppercase hover:bg-brown-50 transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                      Add URL
                    </button>
                  </div>
                </div>

                {/* Video */}
                <div className="border-t border-beige pt-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-display text-lg text-brown-900">Product Video <span className="text-brown-400 text-sm font-body">(optional)</span></h3>
                      <p className="font-body text-[11px] text-brown-500">
                        Upload a clip (max 4MB) or paste a YouTube/Vimeo URL.
                      </p>
                    </div>
                  </div>

                  {form.videoUrl && (
                    <div className="mb-3 relative aspect-video max-w-sm bg-black overflow-hidden">
                      <VideoPreview url={form.videoUrl} />
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, videoUrl: "" })}
                        className="absolute top-2 right-2 bg-red-600 text-cream p-1.5 hover:bg-red-700 transition-colors z-10"
                        title="Remove video"
                      >
                        <X className="h-3.5 w-3.5" strokeWidth={2} />
                      </button>
                    </div>
                  )}

                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      // Max 50MB (GitHub Contents API supports up to 100MB)
                      const MAX_SIZE = 50 * 1024 * 1024;
                      if (file.size > MAX_SIZE) {
                        toast.error(
                          `Video is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is 50MB. For larger videos, use YouTube/Vimeo.`
                        );
                        if (videoInputRef.current) videoInputRef.current.value = "";
                        return;
                      }

                      try {
                        setUploadingVideo(true);
                        setVideoUploadProgress(0);

                        // Step 1: Get GitHub token from server (admin-only)
                        const tokenRes = await fetch("/api/upload/github-token");
                        if (!tokenRes.ok) {
                          throw new Error("Could not get upload permission. Please log in again.");
                        }
                        const { token: githubToken } = await tokenRes.json();

                        // Step 2: Convert file to base64 (in chunks to avoid memory issues)
                        const base64Content = await fileToBase64(file, (progress) => {
                          // Base64 conversion is ~50% of the work
                          setVideoUploadProgress(Math.round(progress * 50));
                        });

                        // Step 3: Upload directly to GitHub Contents API
                        // This bypasses Vercel's 4.5MB body size limit
                        const ext = file.name.split(".").pop() || "mp4";
                        const filename = `video_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
                        const path = `data/videos/${filename}`;

                        setVideoUploadProgress(55);

                        const githubRes = await fetch(
                          `https://api.github.com/repos/tikocraft-max/tikocraft/contents/${path}`,
                          {
                            method: "PUT",
                            headers: {
                              Authorization: `token ${githubToken}`,
                              Accept: "application/vnd.github.v3+json",
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                              message: `upload video: ${filename}`,
                              content: base64Content,
                              branch: "main",
                            }),
                          }
                        );

                        setVideoUploadProgress(90);

                        if (!githubRes.ok) {
                          const errBody = await githubRes.text();
                          console.error("GitHub upload error:", githubRes.status, errBody);
                          throw new Error(
                            `Upload failed (${githubRes.status}). ${githubRes.status === 422 ? "File may already exist." : "Please try again."}`
                          );
                        }

                        // Step 4: Set the video URL (raw URL)
                        const rawUrl = `https://raw.githubusercontent.com/tikocraft-max/tikocraft/main/${path}`;
                        setForm((f) => ({ ...f, videoUrl: rawUrl }));
                        setVideoUploadProgress(100);
                        toast.success(`Video uploaded (${(file.size / 1024 / 1024).toFixed(1)}MB)`);
                      } catch (err) {
                        toast.error(err instanceof Error ? err.message : "Upload failed");
                      } finally {
                        setUploadingVideo(false);
                        setVideoUploadProgress(0);
                        if (videoInputRef.current) videoInputRef.current.value = "";
                      }
                    }}
                  />

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => videoInputRef.current?.click()}
                      disabled={uploadingVideo}
                      className="inline-flex items-center gap-2 bg-brown-800 text-cream px-4 py-2.5 font-body text-[11px] tracking-luxe-sm uppercase hover:bg-brown-900 disabled:opacity-60 transition-colors justify-center"
                    >
                      {uploadingVideo ? (
                        <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading… {videoUploadProgress}%</>
                      ) : (
                        <><Upload className="h-3.5 w-3.5" /> Upload Video</>
                      )}
                    </button>
                    <input
                      type="text"
                      value={form.videoUrl}
                      onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                      placeholder="Or paste YouTube/Vimeo/MP4 URL"
                      className="flex-1 bg-white border border-beige px-4 py-2.5 font-body text-sm text-brown-900 placeholder:text-brown-400 focus:outline-none focus:border-brown-700"
                    />
                  </div>

                  {/* Progress bar */}
                  {uploadingVideo && (
                    <div className="mt-2">
                      <div className="h-1.5 bg-beige rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brown-800 transition-all duration-300"
                          style={{ width: `${videoUploadProgress}%` }}
                        />
                      </div>
                      <p className="font-body text-[10px] text-brown-500 mt-1 text-center">
                        {videoUploadProgress < 50
                          ? "Converting video…"
                          : videoUploadProgress < 90
                          ? "Uploading to storage…"
                          : "Finishing…"}
                      </p>
                    </div>
                  )}

                  <p className="font-body text-[10px] text-brown-500 mt-2 font-light">
                    💡 Upload from your device (max 50MB, MP4/WebM/MOV) or paste a YouTube/Vimeo URL.
                  </p>
                </div>

                {/* Navigation */}
                <div className="flex justify-between pt-2 border-t border-beige">
                  <button
                    type="button"
                    onClick={() => setActiveTab("details")}
                    className="inline-flex items-center gap-2 font-body text-[11px] tracking-luxe-sm uppercase px-4 py-3 text-brown-700 hover:text-brown-900 transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("settings")}
                    className="inline-flex items-center gap-2 bg-brown-800 text-cream px-6 py-3 font-body text-[11px] tracking-luxe-sm uppercase hover:bg-brown-900 transition-colors"
                  >
                    Next: Settings
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ============================================================
                TAB 3: SETTINGS
                ============================================================ */}
            {activeTab === "settings" && (
              <div className="space-y-5 animate-fade-in-up">
                <div className="bg-brown-50/60 border border-beige p-4">
                  <h3 className="font-display text-lg text-brown-900 mb-1">Publishing & Order</h3>
                  <p className="font-body text-[11px] text-brown-500">
                    Control visibility and display order.
                  </p>
                </div>

                {/* Published toggle */}
                <label className="flex items-center justify-between bg-white border border-beige p-4 cursor-pointer hover:border-brown-300 transition-colors">
                  <div>
                    <div className="font-display text-base text-brown-900">Published</div>
                    <div className="font-body text-[11px] text-brown-500 mt-0.5">
                      Visible on the store. Uncheck to hide without deleting.
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={form.isPublished}
                      onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                      className="sr-only"
                    />
                    <div
                      className={`w-11 h-6 rounded-full transition-colors ${
                        form.isPublished ? "bg-brown-800" : "bg-brown-300"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-cream rounded-full transition-transform ${
                          form.isPublished ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </div>
                  </div>
                </label>

                <div>
                  <Label>Sort Order <span className="text-brown-400 normal-case tracking-normal">(lower = appears first)</span></Label>
                  <Input
                    type="number"
                    value={form.sortOrder}
                    onChange={(v) => setForm({ ...form, sortOrder: Number(v) })}
                    placeholder="0"
                  />
                  <p className="font-body text-[10px] text-brown-500 mt-1.5 font-light">
                    Products are sorted by this number (ascending). Use 0 for newest first.
                  </p>
                </div>

                {/* Summary preview */}
                <div className="bg-white border border-beige p-4">
                  <div className="font-body text-[10px] tracking-luxe uppercase text-brown-500 mb-3">
                    Product Summary
                  </div>
                  <div className="flex gap-4">
                    <img
                      src={form.image}
                      alt="Preview"
                      className="w-16 h-16 object-cover bg-beige-light shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-display text-base text-brown-900 leading-tight">
                        {form.name || "Untitled Product"}
                      </div>
                      <div className="font-body text-xs text-brown-500 mt-1">
                        {form.categorySlug} · ${form.priceUSD || 0}
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="font-body text-[10px] text-brown-500">
                          {form.images.length} photo{form.images.length !== 1 ? "s" : ""}
                        </span>
                        {form.videoUrl && (
                          <span className="font-body text-[10px] text-brown-500">· has video</span>
                        )}
                        <span className={`font-body text-[10px] ${form.isPublished ? "text-green-700" : "text-brown-400"}`}>
                          · {form.isPublished ? "published" : "hidden"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation + Save */}
                <div className="flex justify-between pt-4 border-t border-beige">
                  <button
                    type="button"
                    onClick={() => setActiveTab("media")}
                    className="inline-flex items-center gap-2 font-body text-[11px] tracking-luxe-sm uppercase px-4 py-3 text-brown-700 hover:text-brown-900 transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back
                  </button>
                  <div className="flex items-center gap-3">
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
                </div>
              </div>
            )}
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
// Helper: convert File to base64 (with progress callback)
// ============================================================
async function fileToBase64(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the "data:video/mp4;base64," prefix
      const base64 = result.split(",")[1];
      onProgress?.(100);
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Could not read video file"));
    reader.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress((e.loaded / e.total) * 100);
      }
    };
    reader.readAsDataURL(file);
  });
}

// ============================================================
// Small form primitives
// ============================================================

// Video preview — shows video in admin form
function VideoPreview({ url }: { url: string }) {
  // Check if it's a data URL (uploaded file) or external URL
  if (url.startsWith("data:")) {
    return (
      <video
        src={url}
        className="h-full w-full object-contain"
        controls
        muted
        playsInline
      />
    );
  }

  // Parse YouTube
  const youtubeMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
  );
  if (youtubeMatch) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${youtubeMatch[1]}`}
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="Video preview"
      />
    );
  }

  // Parse Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return (
      <iframe
        src={`https://player.vimeo.com/video/${vimeoMatch[1]}`}
        className="h-full w-full"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title="Video preview"
      />
    );
  }

  // Direct video URL (MP4/WebM)
  return (
    <video
      src={url}
      className="h-full w-full object-contain"
      controls
      muted
      playsInline
    />
  );
}

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
