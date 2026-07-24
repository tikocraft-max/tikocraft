"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { pageTransition } from "@/lib/animations";

interface PageShellProps {
  children: ReactNode;
  /** unique key for AnimatePresence to detect page changes */
  pageKey: string;
  className?: string;
}

/**
 * Wraps each "page" view with a consistent layout + enter/exit animation.
 * The key drives AnimatePresence in the parent so old page exits before
 * new page enters.
 */
export default function PageShell({ children, pageKey, className = "" }: PageShellProps) {
  return (
    <motion.div
      key={pageKey}
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`min-h-screen ${className}`}
    >
      {children}
    </motion.div>
  );
}
