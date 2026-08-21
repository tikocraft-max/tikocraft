"use client";

import { motion } from "framer-motion";
import { products } from "@/lib/content";
import SectionHeading from "./section-heading";
import {
  staggerContainer,
  fadeUp,
  viewportOnce,
  easeLuxe,
} from "@/lib/animations";

export default function Products() {
  return (
    <section
      id="products"
      className="relative bg-brown-50 py-24 md:py-36 px-6 lg:px-12 grain-overlay"
    >
      <div className="mx-auto max-w-7xl">
        {/* Intro */}
        <div className="mb-20 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">
          <SectionHeading
            eyebrow="Selected Pieces"
            align="left"
            title={
              <>
                Objects with
                <br />
                <span className="italic font-light text-brown-500">a quiet presence</span>
              </>
            }
            description="A rotating selection of pieces from our catalog — curated for quality, ready to ship, and backed by our support team."
          />
          <motion.button
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="group inline-flex items-center gap-3 self-start lg:self-end border border-brown-700 text-brown-800 px-7 py-3.5 font-body text-xs tracking-luxe-sm uppercase transition-all duration-500 hover:bg-brown-800 hover:text-cream"
          >
            View All Pieces
            <span className="transition-transform duration-500 group-hover:translate-x-1">
              →
            </span>
          </motion.button>
        </div>

        {/* Products grid */}
        <motion.div
          variants={staggerContainer(0.12, 0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 lg:gap-x-8 lg:gap-y-16"
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: (typeof products)[number] }) {
  return (
    <motion.article
      variants={fadeUp}
      className="group cursor-pointer"
    >
      {/* Image container */}
      <div className="relative aspect-square overflow-hidden bg-beige-light mb-6">
        <motion.img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
        />
        {/* Tag */}
        {product.tag && (
          <div className="absolute top-4 left-4">
            <span className="font-body text-[10px] tracking-luxe uppercase bg-brown-800 text-cream px-3 py-1.5">
              {product.tag}
            </span>
          </div>
        )}
        {/* Quick view button — appears on hover */}
        <div className="absolute inset-x-4 bottom-4 translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <button className="w-full bg-cream/95 backdrop-blur-sm text-brown-900 py-3 font-body text-[11px] tracking-luxe-sm uppercase hover:bg-cream transition-colors">
            Quick View
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <span className="font-body text-[10px] tracking-luxe-sm uppercase text-brown-500 block mb-2">
            {product.category}
          </span>
          <h3 className="font-display text-2xl text-brown-900 leading-tight mb-2 transition-colors duration-300 group-hover:text-brown-600">
            {product.name}
          </h3>
          <p className="font-body text-sm text-brown-700/70 leading-relaxed line-clamp-2 font-light">
            {product.description}
          </p>
        </div>
        <span className="font-display text-xl text-brown-800 shrink-0 mt-6">
          {product.price}
        </span>
      </div>

      {/* Divider that animates on hover */}
      <div className="mt-5 h-px bg-brown-200 transition-all duration-500 group-hover:bg-brown-700" />
    </motion.article>
  );
}
