"use client";

import { motion, useScroll, useSpring } from "framer-motion";

// ============================================================
// ScrollProgress — thin gold bar at top of viewport that fills
// as the user scrolls down. Pure ambience — adds editorial polish.
// ============================================================
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="scroll-progress"
      style={{ scaleX }}
      aria-hidden="true"
    />
  );
}
