"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Play,
  Check,
  Truck,
  Shield,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "@/lib/router";
import { useCatalog, type CatalogProduct } from "@/lib/use-catalog";
import { useCurrency } from "@/lib/currency";
import { useCart } from "@/lib/cart";
import {
  staggerContainer,
  fadeUp,
  revealLeft,
  revealRight,
  viewportOnce,
  easeLuxe,
} from "@/lib/animations";
import { toast } from "sonner";

export default function ProductDetailPage({ slug }: { slug: string }) {
  // Inner component keyed by slug — resets all state when product changes
  return <ProductDetailInner key={slug} slug={slug} />;
}

function ProductDetailInner({ slug }: { slug: string }) {
  const { navigate } = useRouter();
  const { products, loading } = useCatalog();
  const { formatPrice } = useCurrency();
  const addItem = useCart((s) => s.addItem);

  const product = products.find((p) => p.slug === slug);

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showVideo, setShowVideo] = useState(false);
  const [added, setAdded] = useState(false);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [slug]);

  if (loading) {
    return (
      <div className="pt-32 min-h-screen bg-cream flex items-center justify-center">
        <div className="font-display text-2xl text-brown-400">Loading…</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-32 min-h-screen bg-cream flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="font-display text-4xl text-brown-900 mb-4">
            Product not found
          </h1>
          <p className="font-body text-brown-600 mb-8">
            This piece may have been removed or is no longer available.
          </p>
          <button
            onClick={() => navigate("products")}
            className="inline-flex items-center gap-3 bg-brown-800 text-cream px-8 py-4 font-body text-xs tracking-luxe-sm uppercase hover:bg-brown-900 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const images = product.images && product.images.length > 0
    ? product.images
    : [product.image];

  const handleAddToCart = () => {
    addItem(
      {
        slug: product.slug,
        name: product.name,
        image: product.image,
        priceUSD: product.priceUSD,
      },
      quantity
    );
    setAdded(true);
    toast.success(`${quantity} × ${product.name} added to cart`);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="pt-28 md:pt-32 min-h-screen bg-cream">
      <div className="mx-auto max-w-7xl px-6 lg:px-12 pb-24">
        {/* Breadcrumb / back */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: easeLuxe }}
          onClick={() => navigate("products")}
          className="group inline-flex items-center gap-2 font-body text-[11px] tracking-luxe-sm uppercase text-brown-600 hover:text-brown-900 transition-colors mb-10"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-500 group-hover:-translate-x-1" />
          Back to all pieces
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* ============================================================
              LEFT: Image gallery + video
              ============================================================ */}
          <motion.div
            variants={staggerContainer(0.1, 0.1)}
            initial="hidden"
            animate="visible"
          >
            {/* Main media area */}
            <motion.div
              variants={revealLeft}
              className="relative aspect-square overflow-hidden bg-beige-light mb-4 img-zoom"
            >
              <AnimatePresence mode="wait">
                {showVideo && product.videoUrl ? (
                  <motion.div
                    key="video"
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.6, ease: easeLuxe }}
                    className="absolute inset-0"
                  >
                    <VideoEmbed url={product.videoUrl} poster={product.image} />
                  </motion.div>
                ) : (
                  <motion.img
                    key={activeImage}
                    src={images[activeImage]}
                    alt={product.name}
                    initial={{ opacity: 0, scale: 1.08 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.7, ease: easeLuxe }}
                    className="h-full w-full object-cover"
                  />
                )}
              </AnimatePresence>

              {/* Tag */}
              {product.tag && !showVideo && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="font-body text-[10px] tracking-luxe uppercase bg-brown-800 text-cream px-3 py-1.5">
                    {product.tag}
                  </span>
                </div>
              )}

              {/* Video toggle (if video exists) */}
              {product.videoUrl && (
                <button
                  onClick={() => setShowVideo((v) => !v)}
                  className={`absolute top-4 right-4 z-10 inline-flex items-center gap-2 font-body text-[10px] tracking-luxe-sm uppercase px-3 py-2 transition-colors ${
                    showVideo
                      ? "bg-brown-800 text-cream"
                      : "bg-cream/90 text-brown-800 hover:bg-cream"
                  }`}
                >
                  {showVideo ? (
                    <>View Photos</>
                  ) : (
                    <>
                      <Play className="h-3 w-3" />
                      Watch Video
                    </>
                  )}
                </button>
              )}
            </motion.div>

            {/* Thumbnail gallery */}
            <div className="grid grid-cols-5 gap-3">
              {images.slice(0, 5).map((img, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setActiveImage(i);
                    setShowVideo(false);
                  }}
                  className={`relative aspect-square overflow-hidden bg-beige-light transition-all duration-300 ${
                    activeImage === i && !showVideo
                      ? "ring-2 ring-brown-800 ring-offset-2 ring-offset-cream"
                      : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} view ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
              {product.videoUrl && (
                <button
                  onClick={() => setShowVideo(true)}
                  className={`relative aspect-square overflow-hidden bg-brown-800 transition-all duration-300 ${
                    showVideo
                      ? "ring-2 ring-brown-800 ring-offset-2 ring-offset-cream"
                      : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play className="h-5 w-5 text-cream" strokeWidth={1.5} />
                  </div>
                  <div className="absolute bottom-1 left-0 right-0 text-center">
                    <span className="font-body text-[8px] tracking-luxe-sm uppercase text-cream">
                      Video
                    </span>
                  </div>
                </button>
              )}
            </div>
          </motion.div>

          {/* ============================================================
              RIGHT: Product info + add to cart
              ============================================================ */}
          <motion.div
            variants={staggerContainer(0.1, 0.15)}
            initial="hidden"
            animate="visible"
            className="lg:pt-4"
          >
            {/* Category */}
            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-brown-400" />
              <span className="font-body text-[11px] tracking-luxe uppercase text-brown-500">
                {product.category}
              </span>
            </motion.div>

            {/* Name */}
            <motion.h1
              variants={fadeUp}
              className="font-display text-4xl md:text-5xl lg:text-6xl text-brown-900 leading-[1.05] mb-6 text-balance"
            >
              {product.name}
            </motion.h1>

            {/* Price */}
            <motion.div variants={fadeUp} className="mb-8">
              <span className="price-num text-3xl text-brown-800">
                {formatPrice(product.priceUSD)}
              </span>
            </motion.div>

            {/* Description */}
            <motion.p
              variants={fadeUp}
              className="font-body text-base text-brown-700/80 leading-relaxed mb-8 font-light"
            >
              {product.description}
            </motion.p>

            {/* Specs */}
            <motion.div
              variants={fadeUp}
              className="grid grid-cols-2 gap-4 mb-8 py-6 border-y border-beige"
            >
              {product.material && (
                <div>
                  <div className="font-body text-[10px] tracking-luxe uppercase text-brown-500 mb-1">
                    Material
                  </div>
                  <div className="font-display text-base text-brown-900">
                    {product.material}
                  </div>
                </div>
              )}
              {product.dimensions && (
                <div>
                  <div className="font-body text-[10px] tracking-luxe uppercase text-brown-500 mb-1">
                    Dimensions
                  </div>
                  <div className="font-display text-base text-brown-900">
                    {product.dimensions}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Quantity selector */}
            <motion.div variants={fadeUp} className="mb-6">
              <label className="font-body text-[10px] tracking-luxe uppercase text-brown-600 block mb-3">
                Quantity
              </label>
              <div className="inline-flex items-center border border-brown-300">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-3 text-brown-700 hover:bg-brown-50 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="font-display text-xl text-brown-900 w-12 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="p-3 text-brown-700 hover:bg-brown-50 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </motion.div>

            {/* Add to cart + buy now */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 mb-8">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                onClick={handleAddToCart}
                className={`btn-shine group inline-flex flex-1 items-center justify-center gap-3 px-8 py-4 font-body text-xs tracking-luxe-sm uppercase transition-all duration-500 ${
                  added
                    ? "bg-green-700 text-cream"
                    : "bg-brown-800 text-cream hover:bg-brown-900"
                }`}
              >
                {added ? (
                  <>
                    <Check className="h-4 w-4" />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4" />
                    Add to Cart
                  </>
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                onClick={() => {
                  handleAddToCart();
                  // Open cart immediately for checkout
                  setTimeout(() => {
                    useCart.getState().openCart();
                  }, 300);
                }}
                className="inline-flex flex-1 items-center justify-center gap-3 border border-brown-700 text-brown-800 px-8 py-4 font-body text-xs tracking-luxe-sm uppercase hover:bg-brown-800 hover:text-cream transition-all duration-500"
              >
                Order Now
                <ArrowRight className="h-3.5 w-3.5" />
              </motion.button>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              variants={fadeUp}
              className="grid grid-cols-3 gap-4 pt-6 border-t border-beige"
            >
              <div className="text-center">
                <Truck className="h-5 w-5 text-brown-500 mx-auto mb-2" strokeWidth={1.2} />
                <div className="font-body text-[10px] tracking-luxe-sm uppercase text-brown-600">
                  Free shipping
                </div>
                <div className="font-body text-[10px] text-brown-400 font-light">
                  over $200
                </div>
              </div>
              <div className="text-center">
                <Shield className="h-5 w-5 text-brown-500 mx-auto mb-2" strokeWidth={1.2} />
                <div className="font-body text-[10px] tracking-luxe-sm uppercase text-brown-600">
                  Secure checkout
                </div>
                <div className="font-body text-[10px] text-brown-400 font-light">
                  guest or account
                </div>
              </div>
              <div className="text-center">
                <RefreshCw className="h-5 w-5 text-brown-500 mx-auto mb-2" strokeWidth={1.2} />
                <div className="font-body text-[10px] tracking-luxe-sm uppercase text-brown-600">
                  30-day returns
                </div>
                <div className="font-body text-[10px] text-brown-400 font-light">
                  no questions
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Video embed — supports YouTube, Vimeo, direct MP4, and
// GitHub raw URLs (uploaded videos)
// ============================================================
function VideoEmbed({ url, poster }: { url: string; poster?: string }) {
  // Parse YouTube URL
  const youtubeMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
  );
  // Parse Vimeo URL
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);

  if (youtubeMatch) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${youtubeMatch[1]}?rel=0&autoplay=1`}
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="Product video"
      />
    );
  }

  if (vimeoMatch) {
    return (
      <iframe
        src={`https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`}
        className="h-full w-full"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title="Product video"
      />
    );
  }

  // Direct MP4/WebM (including GitHub raw URLs for uploaded videos)
  return (
    <video
      src={url}
      poster={poster}
      className="h-full w-full object-contain bg-brown-900"
      controls
      autoPlay
      muted
      loop
      playsInline
    >
      Your browser does not support video playback.
    </video>
  );
}
