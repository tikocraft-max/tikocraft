"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/animations";
import { useRouter } from "@/lib/router";

export default function ShowroomPage() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
  const { navigate } = useRouter();

  const info = [
    {
      label: "Online Store",
      value: "tikocraft.com\nOpen 24/7, worldwide",
    },
    {
      label: "Support Hours",
      value: "Monday — Friday\n24 — 48 hour reply",
    },
    {
      label: "Languages",
      value: "English · French\nArabic · Spanish",
    },
    {
      label: "Response",
      value: "Email & contact form\nWithin two working days",
    },
  ];

  return (
    <div className="bg-brown-900 min-h-screen text-cream">
      {/* Full-bleed hero image with strong parallax */}
      <section
        ref={ref}
        className="relative h-[100vh] min-h-[600px] overflow-hidden flex items-center justify-center"
      >
        <motion.div
          style={{ y: imageY }}
          className="absolute inset-0 z-0 h-[124%] -top-[12%]"
        >
          <img
            src="/images/showroom.png"
            alt="Tikocraft online shop"
            className="h-full w-full object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 z-10 bg-brown-900/60" />
        <div className="absolute inset-0 z-10 grain-overlay" />

        <motion.div
          variants={staggerContainer(0.15, 0.2)}
          initial="hidden"
          animate="visible"
          className="relative z-20 max-w-4xl mx-auto px-6 text-center"
        >
          <motion.div
            variants={fadeUp}
            className="flex items-center justify-center gap-4 mb-8"
          >
            <span className="h-px w-12 bg-beige/60" />
            <span className="font-body text-xs tracking-luxe uppercase text-beige/80">
              The Shop
            </span>
            <span className="h-px w-12 bg-beige/60" />
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-cream leading-[1.02] mb-8 text-balance"
          >
            Take your time,
            <br />
            <span className="italic font-light text-beige">browse</span> the
            collections.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="max-w-xl mx-auto font-body text-base text-cream/80 leading-relaxed font-light mb-12"
          >
            Our shop is online — open any hour, from anywhere. No queues,
            no closing times, no pressure. Browse the collections at your own
            pace and write to us with any question; we reply within two
            working days.
          </motion.p>

          <motion.button
            variants={fadeUp}
            onClick={() => navigate("contact")}
            className="group inline-flex items-center gap-3 bg-cream text-brown-900 px-8 py-4 font-body text-xs tracking-luxe-sm uppercase transition-colors duration-500 hover:bg-beige"
          >
            Send a Message
            <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
          </motion.button>
        </motion.div>
      </section>

      {/* Practical info */}
      <section className="px-6 lg:px-12 py-24 md:py-32">
        <div className="mx-auto max-w-7xl">
          <motion.div
            variants={staggerContainer(0.15, 0.1)}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="mb-20 max-w-3xl"
          >
            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-6">
              <span className="h-px w-8 bg-beige/60" />
              <span className="font-body text-[11px] tracking-luxe uppercase text-beige/80">
                Practical Information
              </span>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="font-display text-4xl sm:text-5xl md:text-6xl text-cream leading-[1.05] text-balance"
            >
              How to shop with us — and what to expect.
            </motion.h2>
          </motion.div>

          <motion.div
            variants={staggerContainer(0.12, 0.1)}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10"
          >
            {info.map((item) => (
              <motion.div
                key={item.label}
                variants={fadeUp}
                className="border-t border-beige/20 pt-6"
              >
                <div className="font-body text-[10px] tracking-luxe uppercase text-beige/60 mb-4">
                  {item.label}
                </div>
                <div className="font-display text-lg text-cream whitespace-pre-line leading-snug">
                  {item.value}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* What to expect */}
      <section className="px-6 lg:px-12 pb-24 md:pb-32">
        <div className="mx-auto max-w-7xl">
          <motion.div
            variants={staggerContainer(0.15, 0.1)}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12"
          >
            {[
              {
                title: "A slow look",
                body: "Plan for a long browse, not a quick buy. Each piece rewards a second and third look — take your time, open the product pages, read the materials.",
              },
              {
                title: "Clear information",
                body: "Dimensions, materials, assembly time, and what is included are stated plainly on every product page. No marketing puff — just the facts you need.",
              },
              {
                title: "Always available",
                body: "The shop is open around the clock, from anywhere in the world. Place an order at 3am on a Sunday — we will see it on Monday morning and confirm within hours.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                className="bg-brown-800/40 border border-beige/15 p-8 lg:p-10"
              >
                <span className="font-display text-sm text-beige/50 tracking-luxe">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-2xl text-cream mt-4 mb-4">
                  {item.title}
                </h3>
                <p className="font-body text-sm text-cream/65 leading-relaxed font-light">
                  {item.body}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 lg:px-12 pb-24 md:pb-32">
        <motion.div
          variants={staggerContainer(0.15, 0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mx-auto max-w-4xl text-center"
        >
          <motion.h2
            variants={fadeUp}
            className="font-display text-4xl sm:text-5xl md:text-6xl text-cream leading-[1.05] mb-8 text-balance"
          >
            Ready to begin?
            <br />
            <span className="italic font-light text-beige">Write to us first.</span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="max-w-xl mx-auto font-body text-base text-cream/70 leading-relaxed font-light mb-10"
          >
            Whether you are commissioning a custom figure, asking about a
            book nook kit, or checking on an order — we read every message
            and write back within two working days.
          </motion.p>
          <motion.button
            variants={fadeUp}
            onClick={() => navigate("contact")}
            className="group inline-flex items-center gap-3 bg-cream text-brown-900 px-8 py-4 font-body text-xs tracking-luxe-sm uppercase transition-colors duration-500 hover:bg-beige"
          >
            Send a Message
            <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
          </motion.button>
        </motion.div>
      </section>
    </div>
  );
}
