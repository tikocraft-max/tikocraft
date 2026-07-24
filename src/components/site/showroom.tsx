"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/animations";

export default function Showroom() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Strong parallax for the showroom image
  const imageY = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  return (
    <section
      ref={ref}
      id="showroom"
      className="relative h-[100vh] min-h-[600px] overflow-hidden flex items-center justify-center"
    >
      {/* Background image with strong parallax */}
      <motion.div
        style={{ y: imageY }}
        className="absolute inset-0 z-0 h-[124%] -top-[12%]"
      >
        <img
          src="/images/showroom.png"
          alt="Tikocraft showroom with curated home decor collection"
          className="h-full w-full object-cover"
        />
      </motion.div>

      {/* Dark overlay */}
      <div className="absolute inset-0 z-10 bg-brown-900/55" />
      <div className="absolute inset-0 z-10 grain-overlay" />

      {/* Content */}
      <motion.div
        variants={staggerContainer(0.15, 0.2)}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        className="relative z-20 max-w-4xl mx-auto px-6 text-center"
      >
        <motion.div
          variants={fadeUp}
          className="flex items-center justify-center gap-4 mb-8"
        >
          <span className="h-px w-12 bg-beige/60" />
          <span className="font-body text-xs tracking-luxe uppercase text-beige/80">
            Visit the Showroom
          </span>
          <span className="h-px w-12 bg-beige/60" />
        </motion.div>

        <motion.h2
          variants={fadeUp}
          className="font-display text-5xl sm:text-6xl md:text-7xl text-cream leading-[1.05] mb-8 text-balance"
        >
          Come sit with the
          <br />
          <span className="italic font-light text-beige">objects</span> before
          you choose.
        </motion.h2>

        <motion.p
          variants={fadeUp}
          className="max-w-xl mx-auto font-body text-base text-cream/80 leading-relaxed font-light mb-12"
        >
          Our showroom is a quiet room above the workshop. No music, no sales
          staff — only the pieces, the light from a north-facing window, and
          tea if you stay a while.
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <div className="text-center">
            <div className="font-body text-[10px] tracking-luxe uppercase text-beige/60 mb-1">
              By appointment
            </div>
            <div className="font-display text-xl text-cream">
              Tuesday — Saturday
            </div>
            <div className="font-body text-sm text-cream/70 font-light">
              10:00 — 18:00
            </div>
          </div>
          <div className="hidden sm:block h-12 w-px bg-beige/40" />
          <button
            onClick={() => {
              document
                .querySelector("#contact")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="group inline-flex items-center gap-3 bg-cream text-brown-900 px-8 py-4 font-body text-xs tracking-luxe-sm uppercase transition-colors duration-500 hover:bg-beige"
          >
            Book a Visit
            <span className="transition-transform duration-500 group-hover:translate-x-1">
              →
            </span>
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
}
