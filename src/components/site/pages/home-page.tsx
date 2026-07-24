"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Hero from "../hero";
import Marquee from "../marquee";
import SectionHeading from "../section-heading";
import { useRouter } from "@/lib/router";
import { collections, products } from "@/lib/content";
import {
  staggerContainer,
  scaleIn,
  fadeUp,
  viewportOnce,
  easeLuxe,
} from "@/lib/animations";

export default function HomePage() {
  const { navigate } = useRouter();
  const featuredCollections = collections.slice(0, 4);
  const decorProducts = products.filter((p) => p.categoryType === "decor").slice(0, 3);
  const booknookProducts = products.filter((p) => p.categoryType === "booknook").slice(0, 3);

  return (
    <div>
      <Hero />
      <Marquee />

      {/* Two-worlds intro */}
      <section className="bg-cream py-24 md:py-32 px-6 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Two Crafts, One Hand"
            title={
              <>
                From earthy vessels
                <br />
                to <span className="italic font-light text-brown-500">miniature worlds</span>.
              </>
            }
            description="Tikocraft began with clay and wood — and grew, quietly, into tiny worlds that glow between books. Two crafts, one slow hand."
          />

          <motion.div
            variants={staggerContainer(0.15, 0.1)}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
          >
            <motion.button
              variants={scaleIn}
              onClick={() => navigate("collections")}
              className="group relative overflow-hidden bg-white text-left cursor-pointer"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src="/images/collection-ceramics.png"
                  alt="Handcrafted home decor"
                  className="h-full w-full object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brown-900/70 via-brown-900/10 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10">
                <span className="font-body text-[11px] tracking-luxe uppercase text-beige mb-3 block">
                  Handmade Decor
                </span>
                <h3 className="font-display text-3xl md:text-4xl text-cream mb-3">
                  Vessels, textiles, light
                </h3>
                <div className="flex items-center gap-3 text-cream">
                  <span className="font-body text-[11px] tracking-luxe-sm uppercase">
                    Browse Collections
                  </span>
                  <span className="h-px w-8 bg-cream transition-all duration-500 group-hover:w-14" />
                </div>
              </div>
            </motion.button>

            <motion.button
              variants={scaleIn}
              onClick={() => navigate("products", "booknooks")}
              className="group relative overflow-hidden bg-white text-left cursor-pointer"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src="/images/booknook-hero.png"
                  alt="3D DIY Book Nooks"
                  className="h-full w-full object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brown-900/70 via-brown-900/10 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10">
                <span className="font-body text-[11px] tracking-luxe uppercase text-beige mb-3 block">
                  3D DIY Book Nooks
                </span>
                <h3 className="font-display text-3xl md:text-4xl text-cream mb-3">
                  Worlds between books
                </h3>
                <div className="flex items-center gap-3 text-cream">
                  <span className="font-body text-[11px] tracking-luxe-sm uppercase">
                    Shop Book Nooks
                  </span>
                  <span className="h-px w-8 bg-cream transition-all duration-500 group-hover:w-14" />
                </div>
              </div>
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Featured Collections preview */}
      <section className="bg-brown-50 py-24 md:py-32 px-6 lg:px-12 grain-overlay">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <SectionHeading
              eyebrow="Four Hands, Four Crafts"
              align="left"
              title={
                <>
                  Collections shaped by
                  <br />
                  <span className="italic font-light text-brown-500">material and patience</span>
                </>
              }
            />
            <motion.button
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              onClick={() => navigate("collections")}
              className="group inline-flex items-center gap-3 self-start border border-brown-700 text-brown-800 px-7 py-3.5 font-body text-xs tracking-luxe-sm uppercase transition-all duration-500 hover:bg-brown-800 hover:text-cream"
            >
              All Collections
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1" />
            </motion.button>
          </div>

          <motion.div
            variants={staggerContainer(0.12, 0.1)}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {featuredCollections.map((collection, index) => (
              <motion.button
                key={collection.id}
                variants={scaleIn}
                onClick={() => navigate("collections")}
                className="group relative overflow-hidden bg-white text-left cursor-pointer aspect-[3/4]"
              >
                <img
                  src={collection.image}
                  alt={collection.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brown-900/80 via-brown-900/20 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="font-display text-xs tracking-luxe text-cream/90">
                    {String(index + 1).padStart(2, "0")} / 05
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <span className="font-body text-[10px] tracking-luxe uppercase text-beige mb-2 block">
                    {collection.subtitle}
                  </span>
                  <h3 className="font-display text-xl text-cream leading-tight">
                    {collection.title}
                  </h3>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Decor products preview */}
      <section className="bg-cream py-24 md:py-32 px-6 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <SectionHeading
              eyebrow="Selected Decor Pieces"
              align="left"
              title={
                <>
                  Objects with
                  <br />
                  <span className="italic font-light text-brown-500">a quiet presence</span>
                </>
              }
            />
            <motion.button
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              onClick={() => navigate("products")}
              className="group inline-flex items-center gap-3 self-start border border-brown-700 text-brown-800 px-7 py-3.5 font-body text-xs tracking-luxe-sm uppercase transition-all duration-500 hover:bg-brown-800 hover:text-cream"
            >
              All Decor Pieces
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1" />
            </motion.button>
          </div>

          <motion.div
            variants={staggerContainer(0.12, 0.1)}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 lg:gap-x-8 lg:gap-y-16"
          >
            {decorProducts.map((product) => (
              <ProductPreviewCard key={product.id} product={product} onClick={() => navigate("products")} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Book Nooks preview */}
      <section className="bg-brown-900 text-cream py-24 md:py-32 px-6 lg:px-12 grain-overlay relative overflow-hidden">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={viewportOnce}
          transition={{ duration: 1.5, ease: easeLuxe }}
          className="absolute -top-6 left-0 right-0 text-center pointer-events-none select-none font-display text-[16vw] md:text-[12vw] leading-none text-cream/[0.04] tracking-tight"
        >
          Book Nooks
        </motion.span>

        <div className="relative mx-auto max-w-7xl">
          <div className="mb-16 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <SectionHeading
              eyebrow="Miniature Worlds"
              light
              align="left"
              title={
                <>
                  Tiny worlds that
                  <br />
                  <span className="italic font-light text-beige">glow between books</span>
                </>
              }
              description="Hand-cut wooden kits you assemble into dioramas — a Parisian alley, an enchanted forest, a tiny library. Slot them between books; they glow."
            />
            <motion.button
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              onClick={() => navigate("products", "booknooks")}
              className="group inline-flex items-center gap-3 self-start border border-cream/40 text-cream px-7 py-3.5 font-body text-xs tracking-luxe-sm uppercase transition-all duration-500 hover:bg-cream hover:text-brown-900"
            >
              All Book Nook Kits
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1" />
            </motion.button>
          </div>

          <motion.div
            variants={staggerContainer(0.12, 0.1)}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 lg:gap-x-8 lg:gap-y-16"
          >
            {booknookProducts.map((product) => (
              <BookNookPreviewCard key={product.id} product={product} onClick={() => navigate("products", "booknooks")} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Atelier teaser */}
      <section className="bg-cream py-24 md:py-32 px-6 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <motion.div
              variants={staggerContainer(0.15, 0.1)}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              className="lg:col-span-5"
            >
              <motion.div variants={fadeUp} className="flex items-center gap-3 mb-6">
                <span className="h-px w-8 bg-brown-400" />
                <span className="font-body text-[11px] tracking-luxe uppercase text-brown-500">
                  The Atelier
                </span>
              </motion.div>
              <motion.h2
                variants={fadeUp}
                className="font-display text-4xl sm:text-5xl md:text-6xl text-brown-900 leading-[1.05] mb-8 text-balance"
              >
                A workshop built around the hand, not the machine.
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="font-body text-base text-brown-700/80 leading-relaxed mb-10 font-light"
              >
                Tikocraft began in a converted stable outside Marrakech, with a
                single kiln and three potters. Today, twelve artisans share the
                same roof — and a second craft: cutting the tiny wooden pieces
                that become our book nooks.
              </motion.p>
              <motion.button
                variants={fadeUp}
                onClick={() => navigate("atelier")}
                className="group inline-flex items-center gap-3 bg-brown-800 text-cream px-8 py-4 font-body text-xs tracking-luxe-sm uppercase transition-all duration-500 hover:bg-brown-900"
              >
                Read Our Story
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1" />
              </motion.button>
            </motion.div>

            <motion.button
              variants={scaleIn}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              onClick={() => navigate("atelier")}
              className="lg:col-span-7 group relative overflow-hidden cursor-pointer"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src="/images/atelier-1.png"
                  alt="Artisan shaping clay on a pottery wheel"
                  className="h-full w-full object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-brown-900/20 transition-opacity duration-700 group-hover:bg-brown-900/30" />
              </div>
            </motion.button>
          </div>
        </div>
      </section>

      {/* Showroom CTA */}
      <section className="relative h-[80vh] min-h-[500px] overflow-hidden">
        <motion.div
          initial={{ scale: 1.15, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={viewportOnce}
          transition={{ duration: 1.6, ease: easeLuxe }}
          className="absolute inset-0"
        >
          <img
            src="/images/showroom.png"
            alt="Tikocraft showroom"
            className="h-full w-full object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-brown-900/55" />
        <div className="absolute inset-0 grain-overlay" />
        <motion.div
          variants={staggerContainer(0.15, 0.2)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="relative z-20 flex h-full flex-col items-center justify-center px-6 text-center"
        >
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-4 mb-8">
            <span className="h-px w-12 bg-beige/60" />
            <span className="font-body text-xs tracking-luxe uppercase text-beige/80">
              Visit the Showroom
            </span>
            <span className="h-px w-12 bg-beige/60" />
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="font-display text-4xl sm:text-5xl md:text-6xl text-cream leading-[1.05] mb-8 text-balance"
          >
            Come sit with the objects
            <br />
            <span className="italic font-light text-beige">before you choose.</span>
          </motion.h2>
          <motion.button
            variants={fadeUp}
            onClick={() => navigate("showroom")}
            className="group inline-flex items-center gap-3 bg-cream text-brown-900 px-8 py-4 font-body text-xs tracking-luxe-sm uppercase transition-colors duration-500 hover:bg-beige"
          >
            Book a Visit
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1" />
          </motion.button>
        </motion.div>
      </section>
    </div>
  );
}

function ProductPreviewCard({
  product,
  onClick,
}: {
  product: (typeof products)[number];
  onClick: () => void;
}) {
  return (
    <motion.button
      variants={fadeUp}
      onClick={onClick}
      className="group cursor-pointer text-left"
    >
      <div className="relative aspect-square overflow-hidden bg-beige-light mb-6">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
        />
        {product.tag && (
          <div className="absolute top-4 left-4">
            <span className="font-body text-[10px] tracking-luxe uppercase bg-brown-800 text-cream px-3 py-1.5">
              {product.tag}
            </span>
          </div>
        )}
      </div>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <span className="font-body text-[10px] tracking-luxe-sm uppercase text-brown-500 block mb-2">
            {product.category}
          </span>
          <h3 className="font-display text-2xl text-brown-900 leading-tight mb-2 transition-colors duration-300 group-hover:text-brown-600">
            {product.name}
          </h3>
        </div>
        <span className="font-display text-xl text-brown-800 shrink-0 mt-6">
          {product.price}
        </span>
      </div>
      <div className="mt-5 h-px bg-brown-200 transition-all duration-500 group-hover:bg-brown-700" />
    </motion.button>
  );
}

function BookNookPreviewCard({
  product,
  onClick,
}: {
  product: (typeof products)[number];
  onClick: () => void;
}) {
  return (
    <motion.button
      variants={fadeUp}
      onClick={onClick}
      className="group cursor-pointer text-left"
    >
      <div className="relative aspect-square overflow-hidden bg-brown-800 mb-6">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-beige/0 via-beige/0 to-beige/0 group-hover:from-beige/20 transition-all duration-700" />
        {product.tag && (
          <div className="absolute top-4 left-4">
            <span className="font-body text-[10px] tracking-luxe uppercase bg-beige text-brown-900 px-3 py-1.5">
              {product.tag}
            </span>
          </div>
        )}
      </div>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <span className="font-body text-[10px] tracking-luxe-sm uppercase text-beige block mb-2">
            {product.category}
          </span>
          <h3 className="font-display text-2xl text-cream leading-tight mb-2 transition-colors duration-300 group-hover:text-beige">
            {product.name}
          </h3>
        </div>
        <span className="font-display text-xl text-beige shrink-0 mt-6">
          {product.price}
        </span>
      </div>
      <div className="mt-5 h-px bg-brown-700 transition-all duration-500 group-hover:bg-beige" />
    </motion.button>
  );
}
