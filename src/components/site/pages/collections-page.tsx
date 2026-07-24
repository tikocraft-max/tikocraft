"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { collections } from "@/lib/content";
import SectionHeading from "../section-heading";
import { useRouter } from "@/lib/router";
import {
  staggerContainer,
  scaleIn,
  fadeUp,
  viewportOnce,
  pageChild,
} from "@/lib/animations";

export default function CollectionsPage() {
  const { navigate } = useRouter();
  const decorCollections = collections.filter((c) => c.category === "decor");
  const booknookCollection = collections.find((c) => c.category === "booknook");

  return (
    <div className="pt-32 md:pt-40 bg-cream min-h-screen">
      {/* Page header */}
      <section className="px-6 lg:px-12 pb-20 md:pb-28">
        <div className="mx-auto max-w-7xl">
          <motion.div
            variants={staggerContainer(0.12, 0.1)}
            initial="hidden"
            animate="visible"
            className="mb-16 md:mb-20"
          >
            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-6">
              <span className="h-px w-8 bg-brown-400" />
              <span className="font-body text-[11px] tracking-luxe uppercase text-brown-500">
                All Collections
              </span>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-brown-900 leading-[1.02] mb-8 text-balance max-w-4xl"
            >
              Five collections,
              <br />
              <span className="italic font-light text-brown-500">two crafts</span>, one hand.
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="max-w-2xl font-body text-base sm:text-lg text-brown-700/80 leading-relaxed font-light"
            >
              From earthy ceramics and woven textiles to hand-cut book nook
              dioramas — each collection is rooted in a single material and the
              slow techniques it asks for.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Decor Collections — full alternating layout */}
      <section className="px-6 lg:px-12 pb-24 md:pb-32">
        <div className="mx-auto max-w-7xl">
          <motion.div
            variants={staggerContainer(0.2, 0.1)}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
          >
            {decorCollections.map((collection, index) => (
              <motion.button
                key={collection.id}
                variants={scaleIn}
                onClick={() => navigate("products")}
                className="group relative overflow-hidden bg-white text-left cursor-pointer"
              >
                <div className="relative aspect-[4/5] sm:aspect-[5/4] overflow-hidden">
                  <img
                    src={collection.image}
                    alt={collection.title}
                    className="h-full w-full object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                  />
                  <div className="absolute top-6 left-6 z-10">
                    <span className="font-display text-sm tracking-luxe text-cream/90">
                      {String(index + 1).padStart(2, "0")} / 05
                    </span>
                  </div>
                  <div className="absolute top-6 right-6 z-10">
                    <span className="font-body text-[10px] tracking-luxe uppercase bg-cream/90 text-brown-800 px-3 py-1.5">
                      {collection.items}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-brown-900/75 via-brown-900/15 to-transparent opacity-80 transition-opacity duration-700 group-hover:opacity-95" />
                  <div className="absolute inset-0 z-10 flex flex-col justify-end p-8 md:p-10">
                    <motion.span
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={viewportOnce}
                      transition={{ delay: 0.2, duration: 0.7 }}
                      className="font-body text-[11px] tracking-luxe uppercase text-beige mb-3"
                    >
                      {collection.subtitle}
                    </motion.span>
                    <h3 className="font-display text-3xl sm:text-4xl text-cream leading-tight mb-3">
                      {collection.title}
                    </h3>
                    <p className="font-body text-sm text-cream/75 leading-relaxed mb-5 max-w-md font-light">
                      {collection.description}
                    </p>
                    <div className="flex items-center gap-3 text-cream">
                      <span className="font-body text-[11px] tracking-luxe-sm uppercase">
                        View Collection
                      </span>
                      <span className="h-px w-8 bg-cream transition-all duration-500 group-hover:w-14" />
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Book Nook collection — special feature */}
      {booknookCollection && (
        <section className="px-6 lg:px-12 pb-24 md:pb-36">
          <motion.div
            variants={staggerContainer(0.15, 0.1)}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="mx-auto max-w-7xl bg-brown-900 text-cream grain-overlay relative overflow-hidden"
          >
            {/* Big background type */}
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={viewportOnce}
              transition={{ duration: 1.5 }}
              className="absolute -top-4 left-0 right-0 text-center pointer-events-none select-none font-display text-[18vw] md:text-[10vw] leading-none text-cream/[0.04] tracking-tight"
            >
              Worlds Between Books
            </motion.span>

            <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-0">
              {/* Image */}
              <motion.div
                variants={scaleIn}
                className="lg:col-span-7 relative aspect-[4/3] lg:aspect-auto lg:min-h-[600px] overflow-hidden"
              >
                <img
                  src={booknookCollection.image}
                  alt={booknookCollection.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-brown-900/40 to-transparent lg:bg-gradient-to-r" />
              </motion.div>

              {/* Content */}
              <motion.div
                variants={fadeUp}
                className="lg:col-span-5 p-10 md:p-14 lg:p-16 flex flex-col justify-center"
              >
                <span className="font-body text-[11px] tracking-luxe uppercase text-beige mb-6">
                  {booknookCollection.subtitle}
                </span>
                <h3 className="font-display text-4xl md:text-5xl text-cream leading-tight mb-6">
                  {booknookCollection.title}
                </h3>
                <p className="font-body text-base text-cream/75 leading-relaxed mb-10 font-light">
                  {booknookCollection.description}
                </p>
                <div className="space-y-4 mb-10">
                  {[
                    "Hand-cut birch plywood pieces",
                    "Warm LED included, USB-powered",
                    "8–12 hours to assemble",
                    "No glue — slots together by hand",
                  ].map((feature, i) => (
                    <motion.div
                      key={feature}
                      variants={pageChild}
                      className="flex items-center gap-4"
                    >
                      <span className="font-display text-sm text-beige/60 w-6">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-body text-sm text-cream/85 font-light">
                        {feature}
                      </span>
                    </motion.div>
                  ))}
                </div>
                <button
                  onClick={() => navigate("products", "booknooks")}
                  className="group inline-flex items-center gap-3 bg-cream text-brown-900 px-8 py-4 font-body text-xs tracking-luxe-sm uppercase transition-colors duration-500 hover:bg-beige self-start"
                >
                  Shop Book Nook Kits
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1" />
                </button>
              </motion.div>
            </div>
          </motion.div>
        </section>
      )}
    </div>
  );
}
