"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/animations";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  light?: boolean;
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  light = false,
}: SectionHeadingProps) {
  const alignment =
    align === "center" ? "items-center text-center" : "items-start text-left";

  return (
    <motion.div
      variants={staggerContainer(0.15, 0.1)}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      className={`flex flex-col ${alignment} gap-5`}
    >
      <motion.div
        variants={fadeUp}
        className={`flex items-center gap-3 ${
          align === "center" ? "" : "flex-row"
        }`}
      >
        <span
          className={`h-px w-8 ${
            light ? "bg-beige/60" : "bg-brown-400"
          }`}
        />
        <span
          className={`font-body text-[11px] tracking-luxe uppercase ${
            light ? "text-beige/80" : "text-brown-500"
          }`}
        >
          {eyebrow}
        </span>
        {align === "center" && (
          <span
            className={`h-px w-8 ${light ? "bg-beige/60" : "bg-brown-400"}`}
          />
        )}
      </motion.div>

      <motion.h2
        variants={fadeUp}
        className={`font-display text-4xl sm:text-5xl md:text-6xl leading-[1.05] tracking-tight text-balance ${
          light ? "text-cream" : "text-brown-900"
        }`}
      >
        {title}
      </motion.h2>

      {description && (
        <motion.p
          variants={fadeUp}
          className={`max-w-2xl font-body text-base sm:text-lg leading-relaxed font-light ${
            light ? "text-cream/70" : "text-brown-700/80"
          }`}
        >
          {description}
        </motion.p>
      )}
    </motion.div>
  );
}
