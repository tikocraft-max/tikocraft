"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import SectionHeading from "../section-heading";
import { useRouter } from "@/lib/router";
import { useCatalog } from "@/lib/use-catalog";
import {
  staggerContainer,
  scaleIn,
  fadeUp,
  viewportOnce,
  pageChild,
} from "@/lib/animations";

export default function CollectionsPage() {
  const { navigate } = useRouter();
  const { categories } = useCatalog();

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
              Three collections,
              <br />
              <span className="italic font-light text-brown-500">one craft</span>.
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="max-w-2xl font-body text-base sm:text-lg text-brown-700/80 leading-relaxed font-light"
            >
              From 3D DIY book nook kits to custom clay figures made from your
              photos — each collection is curated with patience and shipped
              directly to you.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* All Collections — grid layout */}
      <section className="px-6 lg:px-12 pb-24 md:pb-32">
        <div className="mx-auto max-w-7xl">
          <motion.div
            variants={staggerContainer(0.2, 0.1)}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
          >
            {categories.map((collection, index) => (
              <motion.button
                key={collection.id}
                variants={scaleIn}
                onClick={() => {
                  if (collection.slug === "custom-figures") {
                    navigate("custom-clay");
                  } else {
                    navigate("products", "booknooks");
                  }
                }}
                className="group relative overflow-hidden bg-white text-left cursor-pointer"
              >
                <div className="relative aspect-[4/5] sm:aspect-[5/4] overflow-hidden">
                  <img
                    src={collection.image || "/images/booknook-hero.png"}
                    alt={collection.title}
                    className="h-full w-full object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                  />
                  <div className="absolute top-6 left-6 z-10">
                    <span className="font-display text-sm tracking-luxe text-cream/90">
                      {String(index + 1).padStart(2, "0")} / {String(categories.length).padStart(2, "0")}
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
                        {collection.slug === "custom-figures" ? "Start Your Order" : "View Collection"}
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
    </div>
  );
}
