"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { ShoppingBag, Plus } from "lucide-react";
import { useCatalog } from "@/lib/use-catalog";
import { useCurrency } from "@/lib/currency";
import { useRouter } from "@/lib/router";
import { useCart } from "@/lib/cart";
import SectionHeading from "../section-heading";
import {
  staggerContainer,
  fadeUp,
  viewportOnce,
} from "@/lib/animations";
import type { CatalogProduct } from "@/lib/use-catalog";
import { toast } from "sonner";

type FilterType = "all" | "decor" | "booknook";

function deriveInitialFilter(param: string | null): FilterType {
  if (param === "booknooks") return "booknook";
  if (param === "decor") return "decor";
  return "all";
}

export default function ProductsPage() {
  const { pageParam, navigate } = useRouter();
  const { products } = useCatalog();
  const { formatPrice } = useCurrency();
  const [filter, setFilter] = useState<FilterType>(() => deriveInitialFilter(pageParam));

  useEffect(() => {
    const next = deriveInitialFilter(pageParam);
    if (next !== filter) {
      Promise.resolve().then(() => setFilter(next));
    }
  }, [pageParam, filter]);

  const filteredProducts = useMemo(() => {
    if (filter === "all") return products;
    return products.filter((p) => p.categoryType === filter);
  }, [filter, products]);

  const isDark = filter === "booknook" || filter === "all";

  return (
    <div
      className={`pt-32 md:pt-40 min-h-screen transition-colors duration-700 ${
        isDark ? "bg-brown-900 text-cream" : "bg-cream text-brown-900"
      }`}
    >
      {/* Page header */}
      <section className="px-6 lg:px-12 pb-16 md:pb-20">
        <div className="mx-auto max-w-7xl">
          <motion.div
            variants={staggerContainer(0.12, 0.1)}
            initial="hidden"
            animate="visible"
            className="mb-12 md:mb-16"
          >
            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-6">
              <span
                className={`h-px w-8 ${
                  isDark ? "bg-beige/60" : "bg-brown-400"
                }`}
              />
              <span
                className={`font-body text-[11px] tracking-luxe uppercase ${
                  isDark ? "text-beige/80" : "text-brown-500"
                }`}
              >
                Selected Pieces
              </span>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className={`font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[1.02] mb-8 text-balance max-w-4xl ${
                isDark ? "text-cream" : "text-brown-900"
              }`}
            >
              Objects with
              <br />
              <span className={`italic font-light ${isDark ? "text-beige" : "text-brown-500"}`}>
                a quiet presence
              </span>
              .
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className={`max-w-2xl font-body text-base sm:text-lg leading-relaxed font-light ${
                isDark ? "text-cream/70" : "text-brown-700/80"
              }`}
            >
              A rotating selection of finished pieces and book nook kits from
              the atelier — each one signed, dated, and ready to ship. Click any
              piece for full details, images, and video.
            </motion.p>
          </motion.div>

          {/* Filter bar */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap items-center gap-3 border-t border-b py-6"
            style={{
              borderColor: isDark ? "rgba(232,213,183,0.2)" : "rgba(184,148,106,0.3)",
            }}
          >
            <span
              className={`font-body text-[10px] tracking-luxe uppercase mr-4 ${
                isDark ? "text-beige/60" : "text-brown-500"
              }`}
            >
              Filter
            </span>
            {(
              [
                { id: "all", label: "All Pieces" },
                { id: "decor", label: "Handmade Decor" },
                { id: "booknook", label: "Book Nook Kits" },
              ] as { id: FilterType; label: string }[]
            ).map((opt) => (
              <button
                key={opt.id}
                onClick={() => setFilter(opt.id)}
                className={`relative font-body text-[11px] tracking-luxe-sm uppercase px-5 py-2.5 transition-all duration-300 ${
                  filter === opt.id
                    ? isDark
                      ? "bg-cream text-brown-900"
                      : "bg-brown-800 text-cream"
                    : isDark
                    ? "border border-cream/30 text-cream/80 hover:border-cream"
                    : "border border-brown-300 text-brown-700 hover:border-brown-700"
                }`}
              >
                {opt.label}
              </button>
            ))}
            <span
              className={`ml-auto font-body text-[11px] tracking-luxe-sm ${
                isDark ? "text-beige/60" : "text-brown-500"
              }`}
            >
              {filteredProducts.length} {filteredProducts.length === 1 ? "piece" : "pieces"}
            </span>
          </motion.div>
        </div>
      </section>

      {/* Products grid */}
      <section className="px-6 lg:px-12 pb-24 md:pb-32">
        <div className="mx-auto max-w-7xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={filter}
              variants={staggerContainer(0.1, 0.1)}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, transition: { duration: 0.3 } }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 lg:gap-x-8 lg:gap-y-16"
            >
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isDark={isDark}
                  formatPrice={formatPrice}
                  onNavigate={() => navigate("product", product.slug)}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}

function ProductCard({
  product,
  isDark,
  formatPrice,
  onNavigate,
}: {
  product: CatalogProduct;
  isDark: boolean;
  formatPrice: (usd: number) => string;
  onNavigate: () => void;
}) {
  const addItem = useCart((s) => s.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      slug: product.slug,
      name: product.name,
      image: product.image,
      priceUSD: product.priceUSD,
    });
    toast.success(`${product.name} added to cart`);
  };

  return (
    <motion.article
      variants={fadeUp}
      className="group cursor-pointer"
      onClick={onNavigate}
    >
      <div
        className={`relative aspect-square overflow-hidden mb-6 ${
          isDark ? "bg-brown-800" : "bg-beige-light"
        }`}
      >
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
        />
        {product.tag && (
          <div className="absolute top-4 left-4">
            <span
              className={`font-body text-[10px] tracking-luxe uppercase px-3 py-1.5 ${
                isDark
                  ? "bg-beige text-brown-900"
                  : "bg-brown-800 text-cream"
              }`}
            >
              {product.tag}
            </span>
          </div>
        )}
        {/* Video indicator */}
        {product.videoUrl && (
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center gap-1 font-body text-[9px] tracking-luxe-sm uppercase bg-cream/90 text-brown-800 px-2 py-1">
              <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full" />
              Video
            </span>
          </div>
        )}
        {/* Quick view + add to cart buttons on hover */}
        <div className="absolute inset-x-4 bottom-4 translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate();
            }}
            className={`flex-1 backdrop-blur-sm py-3 font-body text-[10px] tracking-luxe-sm uppercase transition-colors ${
              isDark ? "bg-cream/95 text-brown-900 hover:bg-cream" : "bg-cream/95 text-brown-900 hover:bg-cream"
            }`}
          >
            View Details
          </button>
          <button
            onClick={handleAddToCart}
            className={`backdrop-blur-sm p-3 transition-colors ${
              isDark ? "bg-brown-900/80 text-cream hover:bg-brown-900" : "bg-brown-800/90 text-cream hover:bg-brown-800"
            }`}
            aria-label="Add to cart"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <span
            className={`font-body text-[10px] tracking-luxe-sm uppercase block mb-2 ${
              isDark ? "text-beige/70" : "text-brown-500"
            }`}
          >
            {product.category}
          </span>
          <h3
            className={`font-display text-2xl leading-tight mb-2 transition-colors duration-300 ${
              isDark
                ? "text-cream group-hover:text-beige"
                : "text-brown-900 group-hover:text-brown-600"
            }`}
          >
            {product.name}
          </h3>
          <p
            className={`font-body text-sm leading-relaxed line-clamp-2 font-light ${
              isDark ? "text-cream/60" : "text-brown-700/70"
            }`}
          >
            {product.description}
          </p>
        </div>
        <span
          className={`font-display text-xl shrink-0 mt-6 ${
            isDark ? "text-beige" : "text-brown-800"
          }`}
        >
          {formatPrice(product.priceUSD)}
        </span>
      </div>
      <div
        className={`mt-5 h-px transition-all duration-500 ${
          isDark
            ? "bg-brown-700 group-hover:bg-beige"
            : "bg-brown-200 group-hover:bg-brown-700"
        }`}
      />
    </motion.article>
  );
}
