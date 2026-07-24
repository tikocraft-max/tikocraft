"use client";

import { motion } from "framer-motion";
import { collections } from "@/lib/content";
import SectionHeading from "./section-heading";
import {
  staggerContainer,
  scaleIn,
  fadeUp,
  viewportOnce,
} from "@/lib/animations";

export default function Collections() {
  return (
    <section
      id="collections"
      className="relative bg-cream py-24 md:py-36 px-6 lg:px-12"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section intro */}
        <div className="mb-20">
          <SectionHeading
            eyebrow="Four Hands, Four Crafts"
            title={
              <>
                Collections shaped by
                <br />
                <span className="italic font-light text-brown-500">
                  material and patience
                </span>
              </>
            }
            description="Each collection is rooted in a single material and the slow techniques it asks for. Browse by craft — or let the objects find you."
          />
        </div>

        {/* Collections grid — alternating layout for visual rhythm */}
        <motion.div
          variants={staggerContainer(0.15, 0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
        >
          {collections.map((collection, index) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              index={index}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function CollectionCard({
  collection,
  index,
}: {
  collection: (typeof collections)[number];
  index: number;
}) {
  return (
    <motion.article
      variants={scaleIn}
      className="group relative overflow-hidden bg-white cursor-pointer"
    >
      {/* Image */}
      <div className="relative aspect-[4/5] sm:aspect-[5/4] overflow-hidden">
        <motion.img
          src={collection.image}
          alt={collection.title}
          className="h-full w-full object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
        />
        {/* Top-left number */}
        <div className="absolute top-6 left-6 z-10">
          <span className="font-display text-sm tracking-luxe text-cream/90">
            {String(index + 1).padStart(2, "0")} / 04
          </span>
        </div>
        {/* Tag */}
        <div className="absolute top-6 right-6 z-10">
          <span className="font-body text-[10px] tracking-luxe uppercase bg-cream/90 text-brown-800 px-3 py-1.5">
            {collection.items}
          </span>
        </div>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-brown-900/70 via-brown-900/10 to-transparent opacity-80 transition-opacity duration-700 group-hover:opacity-95" />

        {/* Content overlay */}
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
    </motion.article>
  );
}
