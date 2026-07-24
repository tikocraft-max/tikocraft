"use client";

import { Variants, Transition } from "framer-motion";

// ============================================================
// Tikocraft — Reusable Framer Motion animation variants
// ============================================================

// Easing curves for luxury feel — slow and smooth
export const easeLuxe: Transition["ease"] = [0.22, 1, 0.36, 1];
export const easeSoft: Transition["ease"] = [0.4, 0, 0.2, 1];
export const easeCurtain: Transition["ease"] = [0.76, 0, 0.24, 1];

// Fade up — used for hero text and section intros
export const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
    filter: "blur(8px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 1.1,
      ease: easeLuxe,
    },
  },
};

// Fade in only
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 1.2, ease: easeLuxe },
  },
};

// Reveal from left
export const revealLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -60,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 1.1,
      ease: easeLuxe,
    },
  },
};

// Reveal from right
export const revealRight: Variants = {
  hidden: {
    opacity: 0,
    x: 60,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 1.1,
      ease: easeLuxe,
    },
  },
};

// Scale in — for images and product cards
export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.94,
    y: 30,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 1.0,
      ease: easeLuxe,
    },
  },
};

// Container that staggers children
export const staggerContainer = (stagger: number = 0.12, delay: number = 0): Variants => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: stagger,
      delayChildren: delay,
    },
  },
});

// Slide down for nav
export const slideDown: Variants = {
  hidden: { y: -100, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.8, ease: easeLuxe },
  },
};

// Image zoom on scroll (for parallax effect)
export const imageReveal: Variants = {
  hidden: {
    opacity: 0,
    scale: 1.15,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 1.4,
      ease: easeLuxe,
    },
  },
};

// ============================================================
// UNIQUE PAGE TRANSITIONS
// ============================================================

// Page wrapper transition — a soft curtain + fade + slide
// The exiting page fades + scales down slightly while sliding up
export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    y: 30,
    filter: "blur(10px)",
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.8,
      ease: easeLuxe,
      when: "beforeChildren",
      staggerChildren: 0.08,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    filter: "blur(8px)",
    transition: {
      duration: 0.5,
      ease: easeLuxe,
    },
  },
};

// Overlay curtain that wipes across the screen during page transitions
export const curtainTransition: Variants = {
  initial: {
    scaleY: 0,
    transformOrigin: "bottom",
  },
  animate: {
    scaleY: [0, 1, 1, 0],
    transformOrigin: ["bottom", "bottom", "top", "top"],
    transition: {
      duration: 1.0,
      ease: easeCurtain,
      times: [0, 0.4, 0.6, 1],
    },
  },
};

// Staggered children inside a page (for content reveal after transition)
export const pageChild: Variants = {
  initial: {
    opacity: 0,
    y: 24,
    filter: "blur(6px)",
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.7,
      ease: easeLuxe,
    },
  },
};

// Word-by-word reveal for large display text
export const wordReveal: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.9,
      ease: easeLuxe,
    },
  },
};

// Letter-by-letter for special headings
export const letterReveal: Variants = {
  hidden: { opacity: 0, y: "100%" },
  visible: {
    opacity: 1,
    y: "0%",
    transition: {
      duration: 0.8,
      ease: easeLuxe,
    },
  },
};

// Continuous floating animation
export const floatingAnimation = {
  initial: { y: 0 },
  animate: {
    y: [-8, 8, -8],
    transition: {
      duration: 6,
      ease: "easeInOut" as const,
      repeat: Infinity,
    },
  },
};

// Slow continuous rotation (for decorative elements)
export const slowRotate = {
  initial: { rotate: 0 },
  animate: {
    rotate: 360,
    transition: {
      duration: 40,
      ease: "linear" as const,
      repeat: Infinity,
    },
  },
};

// Image clip-path reveal — wipes in from left to right
export const clipRevealLeft: Variants = {
  hidden: {
    clipPath: "inset(0 100% 0 0)",
    opacity: 0,
  },
  visible: {
    clipPath: "inset(0 0% 0 0)",
    opacity: 1,
    transition: {
      duration: 1.2,
      ease: easeLuxe,
    },
  },
};

// Image clip-path reveal — wipes in from bottom
export const clipRevealBottom: Variants = {
  hidden: {
    clipPath: "inset(100% 0 0 0)",
    opacity: 0,
  },
  visible: {
    clipPath: "inset(0% 0 0 0)",
    opacity: 1,
    transition: {
      duration: 1.2,
      ease: easeLuxe,
    },
  },
};

// Hover lift for cards
export const hoverLift = {
  rest: { y: 0 },
  hover: {
    y: -8,
    transition: { duration: 0.5, ease: easeLuxe },
  },
};

// Default viewport config for whileInView
export const viewportOnce = { once: true, amount: 0.2 } as const;
export const viewportSoft = { once: true, amount: 0.1 } as const;
