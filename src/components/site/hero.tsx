"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ChevronDown } from "lucide-react";
import { fadeUp, staggerContainer, easeLuxe } from "@/lib/animations";
import { useRouter } from "@/lib/router";

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const { navigate } = useRouter();

  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [0.55, 0.85]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "60%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative h-screen min-h-[680px] w-full overflow-hidden"
    >
      <motion.div
        style={{ y: imageY, scale: imageScale }}
        className="absolute inset-0 z-0"
      >
        <img
          src="/images/hero.png"
          alt="Tikocraft luxury living room interior with handcrafted decor"
          className="h-full w-full object-cover"
        />
      </motion.div>

      <motion.div
        style={{ opacity: overlayOpacity }}
        className="absolute inset-0 z-10 bg-gradient-to-b from-brown-900/60 via-brown-900/40 to-brown-900/80"
      />
      <div className="absolute inset-0 z-10 grain-overlay" />

      <motion.div
        style={{ y: textY, opacity: textOpacity }}
        className="relative z-20 flex h-full flex-col items-center justify-center px-6 text-center"
      >
        <motion.div
          variants={staggerContainer(0.18, 0.4)}
          initial="hidden"
          animate="visible"
          className="max-w-5xl"
        >
          <motion.div
            variants={fadeUp}
            className="flex items-center justify-center gap-4 mb-8"
          >
            <span className="h-px w-12 bg-beige/60" />
            <span className="font-body text-[11px] tracking-luxe uppercase text-beige/80">
              Handcrafted Decor · 3D DIY Book Nooks · Est. 2018
            </span>
            <span className="h-px w-12 bg-beige/60" />
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-cream leading-[0.95] tracking-tight"
          >
            Objects made
            <br />
            <span className="italic font-light text-beige">slowly</span>, to be
            <br />
            lived with long.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-10 mx-auto max-w-xl font-body text-base sm:text-lg text-cream/80 leading-relaxed font-light"
          >
            Tikocraft is a small atelier of ceramicists, weavers, woodworkers —
            and makers of miniature worlds. Earthy home objects, and 3D DIY book
            nook kits, shaped one piece at a time.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={() => navigate("collections")}
              className="group relative inline-flex items-center gap-3 bg-cream text-brown-900 px-8 py-4 font-body text-xs tracking-luxe-sm uppercase overflow-hidden transition-colors duration-500 hover:bg-beige"
            >
              <span className="relative z-10">Explore Collections</span>
              <span className="relative z-10 transition-transform duration-500 group-hover:translate-x-1">
                →
              </span>
            </button>
            <button
              onClick={() => navigate("products", "booknooks")}
              className="inline-flex items-center gap-3 border border-cream/40 text-cream px-8 py-4 font-body text-xs tracking-luxe-sm uppercase transition-all duration-500 hover:border-cream hover:bg-cream/10"
            >
              Shop Book Nooks
            </button>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 1, ease: easeLuxe }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
      >
        <span className="font-body text-[10px] tracking-luxe uppercase text-cream/60">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="h-4 w-4 text-cream/60" />
        </motion.div>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 z-15 h-32 bg-gradient-to-t from-cream to-transparent" />
    </section>
  );
}
