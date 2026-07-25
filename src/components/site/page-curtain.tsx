"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "@/lib/router";
import { easeCurtain } from "@/lib/animations";

// ============================================================
// PageCurtain — a brown overlay that wipes up when navigating
// between pages, then wipes back down to reveal the new page.
// Adds a luxurious, magazine-like rhythm to page changes.
// ============================================================
export default function PageCurtain() {
  const { isTransitioning } = useRouter();

  return (
    <AnimatePresence>
      {isTransitioning && (
        <motion.div
          className="page-curtain grain-overlay"
          initial={{ scaleY: 0, transformOrigin: "bottom" }}
          animate={{
            scaleY: [0, 1, 1, 0],
            transformOrigin: ["bottom", "bottom", "top", "top"],
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 1.0,
            ease: easeCurtain,
            times: [0, 0.4, 0.6, 1],
          }}
        >
          {/* Centered logo during transition */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.0, times: [0, 0.3, 0.7, 1] }}
          >
            <img
              src="/images/logo-cream.png"
              alt="Tikocraft"
              className="h-10 w-auto opacity-60"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
