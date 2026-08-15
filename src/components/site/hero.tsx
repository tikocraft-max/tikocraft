"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { fadeUp, staggerContainer, easeLuxe, easeExpo, clipRevealIris } from "@/lib/animations";
import { useRouter } from "@/lib/router";

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const { navigate } = useRouter();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Slightly reduced parallax — text is now anchored to the bottom,
  // so a large y-shift would scroll it off too quickly.
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [0.55, 0.85]);

  // TEXT REVEAL ON SCROLL:
  // The hero text block is HIDDEN on page load — the user sees only the
  // looping workshop video (Tiko's face, the book nooks behind him, the
  // waving gesture). As soon as the user starts scrolling down, the text
  // fades in + slides up into its final position. It stays readable through
  // most of the hero, then fades out as the hero exits the viewport.
  //
  // opacity: 0 → 1 over [0, 0.06] (first 6% of scroll = ~40px on a 700px hero)
  //          1 → 1 over [0.06, 0.55] (hold while scrolling through hero)
  //          1 → 0 over [0.55, 0.85] (fade out as hero leaves viewport)
  // y:       8% → 0% over [0, 0.06] (slide up into position as it fades in)
  //          0% → 20% over [0.06, 1] (parallax lag — text drifts down as
  //          section scrolls up, creating depth)
  const textOpacity = useTransform(
    scrollYProgress,
    [0, 0.06, 0.55, 0.85],
    [0, 1, 1, 0]
  );
  const textY = useTransform(scrollYProgress, [0, 0.06, 1], ["8%", "0%", "20%"]);

  // Scroll hint fades out once the user has started scrolling (they've got
  // the message, no need to keep flashing the chevron at them).
  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.04], [1, 0]);

  // hasScrolled flips to true on the first scroll event and stays true. It
  // triggers the staggered children reveal (eyebrow → headline → copy → CTAs)
  // inside the text block — so when the user scrolls, the elements don't all
  // appear at once, they cascade in with a 0.15s stagger for an editorial feel.
  const [hasScrolled, setHasScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 20 && !hasScrolled) setHasScrolled(true);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hasScrolled]);

  // Detect when video has actually started playing so we can crossfade
  // from the poster image to the live video — no black flash.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onPlaying = () => setVideoReady(true);
    const onCanPlay = () => setVideoReady(true);
    v.addEventListener("playing", onPlaying);
    v.addEventListener("canplay", onCanPlay);
    // Safety: if the video is already ready (cached), mark it.
    if (v.readyState >= 3) setVideoReady(true);
    return () => {
      v.removeEventListener("playing", onPlaying);
      v.removeEventListener("canplay", onCanPlay);
    };
  }, []);

  return (
    <section
      ref={ref}
      className="relative h-screen min-h-[680px] w-full overflow-hidden bg-brown-900"
    >
      {/* Video background with iris reveal on load + parallax on scroll.
          object-position biases the framing toward the TOP of the video,
          which pushes Tiko's face DOWN on screen — clear of the navbar.
          The section background is a solid brown-900 — so while the video
          buffers, the user sees a clean brown screen, NOT a stale poster
          image. The video then fades in on top of it. */}
      <motion.div
        variants={clipRevealIris}
        initial="hidden"
        animate="visible"
        style={{ y: imageY, scale: imageScale }}
        className="absolute inset-0 z-0"
      >
        {/* Looping workshop video — muted, autoplay, playsInline for browser compatibility.

            FRAMING FIX: Tiko's face sits at ~45% from the top of the source video,
            which is exactly where the hero text block lives — so the text was
            covering his face. Since the video is 16:9 and the viewport is ~16:9,
            object-position has no effect (no cropping). The only way to shift the
            face UP on screen is a CSS transform: scale up + translate up.

            transform: translateY(-25%) scale(1.25) with origin 'top center':
              • scale(1.25) grows the video to 125% of section height (top fixed)
              • translateY(-25%) shifts it up by 25% of section height
              • Net: video spans -25% → 100% of section (no bottom gap)
              • Face at 45% of source → 45% × 1.25 − 25% = 31.25% of screen
              • Text block starts ~45% → clear 14% gap between face and text

            No poster image — section bg-brown-900 is the fallback color. */}
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[1.6s] ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            opacity: videoReady ? 1 : 0,
            objectPosition: "center top",
            transform: "translateY(-25%) scale(1.25)",
            transformOrigin: "top center",
          }}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-label="Tiko at work in his atelier — crafting a custom figure among book nooks, waving to the camera"
        >
          <source src="/videos/tiko-workshop.mp4" type="video/mp4" />
        </video>
      </motion.div>

      {/* Cinematic gradient overlays — heavier at top (for navbar) and
          bottom (for hero text) so the subject stays visible in the middle.
          The middle band is kept lighter to keep Tiko's face unobscured. */}
      <motion.div
        style={{ opacity: overlayOpacity }}
        className="absolute inset-0 z-10 bg-gradient-to-b from-brown-900/70 via-brown-900/20 to-brown-900/90"
      />
      {/* Localized scrim behind the hero text block at the bottom — starts
          at ~38% so Tiko's face (now at ~31% after the transform shift)
          stays bright and uncovered. Text block starts ~45%. */}
      <div className="absolute inset-x-0 bottom-0 h-[62%] z-10 pointer-events-none [background:linear-gradient(to_bottom,transparent_0%,rgba(40,28,18,0.0)_15%,rgba(40,28,18,0.35)_40%,rgba(40,28,18,0.78)_75%,rgba(40,28,18,0.92)_100%)]" />
      {/* Side vignette — biases the radial highlight to ~31% (upper area),
          where Tiko's face now sits after the transform shift. */}
      <div className="absolute inset-0 z-10 pointer-events-none [background:radial-gradient(120%_90%_at_50%_31%,transparent_55%,rgba(40,28,18,0.5)_100%)]" />
      <div className="absolute inset-0 z-10 grain-overlay" />

      {/* Hero text — anchored to the bottom so the upper half stays
          clear for Tiko's face. The eyebrow / headline / copy / CTAs
          all sit together as a single editorial block.

          OUTER motion.div: scroll-driven opacity + parallax y. At scroll 0
          this is fully transparent (opacity 0) and shifted down 8% — the
          text is invisible, only the video shows.

          INNER motion.div: staggered children reveal, triggered by
          `hasScrolled` (flips true on first scroll > 20px). Children
          cascade in with a 0.15s stagger for an editorial feel. */}
      <motion.div
        style={{ y: textY, opacity: textOpacity }}
        className="relative z-20 flex h-full flex-col items-center justify-end pb-28 px-6 text-center"
      >
        <motion.div
          variants={staggerContainer(0.15, 0)}
          initial="hidden"
          animate={hasScrolled ? "visible" : "hidden"}
          className="max-w-5xl"
        >
          <motion.div
            variants={fadeUp}
            className="flex items-center justify-center gap-4 mb-6"
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
            className="mt-8 mx-auto max-w-xl font-body text-base sm:text-lg text-cream/80 leading-relaxed font-light"
          >
            Tikocraft is a small atelier of ceramicists, weavers, woodworkers —
            and makers of miniature worlds. Earthy home objects, and 3D DIY book
            nook kits, shaped one piece at a time.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              onClick={() => navigate("collections")}
              className="btn-shine group relative inline-flex items-center gap-3 bg-cream text-brown-900 px-8 py-4 font-body text-xs tracking-luxe-sm uppercase overflow-hidden transition-colors duration-500 hover:bg-beige"
            >
              <span className="relative z-10">Explore Collections</span>
              <span className="relative z-10 transition-transform duration-500 group-hover:translate-x-1">
                →
              </span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              onClick={() => navigate("products", "booknooks")}
              className="inline-flex items-center gap-3 border border-cream/40 text-cream px-8 py-4 font-body text-xs tracking-luxe-sm uppercase transition-all duration-500 hover:border-cream hover:bg-cream/10"
            >
              Shop Book Nooks
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* "Live from the atelier" badge — sits in the upper-right area,
          near Tiko's face (now at ~31% after the transform shift). */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: videoReady ? 1 : 0, x: 0 }}
        transition={{ delay: 2.0, duration: 1.0, ease: easeLuxe }}
        className="absolute top-24 right-6 md:right-10 z-20 hidden md:flex items-center gap-2.5 select-none"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-beige/60 animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-beige" />
        </span>
        <span className="font-body text-[10px] tracking-luxe uppercase text-beige/80">
          Live from the atelier
        </span>
      </motion.div>

      {/* Scroll indicator — the PRIMARY hint on initial load, since the hero
          text is now hidden. Appears after a 1.5s delay (let the video settle),
          then fades out as soon as the user starts scrolling. Compact, sits at
          the very bottom of the hero. */}
      <motion.div
        style={{ opacity: scrollHintOpacity }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5"
      >
        <motion.span
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 1, ease: easeLuxe }}
          className="font-body text-[10px] tracking-luxe uppercase text-cream/70"
        >
          Scroll to explore
        </motion.span>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 6, 0] }}
          transition={{
            opacity: { delay: 1.5, duration: 1, ease: easeLuxe },
            y: { delay: 1.5, duration: 2, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <ChevronDown className="h-4 w-4 text-cream/70" />
        </motion.div>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 z-15 h-32 bg-gradient-to-t from-cream to-transparent" />
    </section>
  );
}
