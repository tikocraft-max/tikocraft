"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Upload,
  Check,
  Loader2,
  Gift,
  User,
  Mail,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import {
  staggerContainer,
  fadeUp,
  revealLeft,
  revealRight,
  viewportOnce,
  easeLuxe,
} from "@/lib/animations";
import { useCurrency } from "@/lib/currency";
import { toast } from "sonner";

// ============================================================
// Size tiers with pricing
// ============================================================
const SIZE_TIERS = [
  {
    id: "small",
    label: "Small",
    dimensions: "8–10 cm tall",
    priceUSD: 85,
    description: "Perfect for desk companions or shelf display.",
    details: "Single figure, simple pose, basic colors.",
  },
  {
    id: "medium",
    label: "Medium",
    dimensions: "12–15 cm tall",
    priceUSD: 145,
    description: "Our most popular size — detailed and expressive.",
    details: "Single figure, detailed pose, custom outfit, accessories.",
    popular: true,
  },
  {
    id: "large",
    label: "Large",
    dimensions: "18–22 cm tall",
    priceUSD: 235,
    description: "A statement piece with full detail and complexity.",
    details: "Single figure, full detail, elaborate outfit, props, base.",
  },
  {
    id: "duo",
    label: "Duo Set",
    dimensions: "Two figures, 10–12 cm each",
    priceUSD: 320,
    description: "Two figures together — couples, friends, family.",
    details: "Two interacting figures, shared base, matching style.",
  },
];

const OCCASIONS = [
  { id: "personal", label: "For myself", icon: User },
  { id: "gift", label: "As a gift", icon: Gift },
  { id: "memorial", label: "Memorial", icon: Sparkles },
  { id: "other", label: "Other", icon: MessageSquare },
];

export default function CustomClayPage() {
  const { formatPrice, convertPrice } = useCurrency();
  const [selectedSize, setSelectedSize] = useState("medium");
  const [occasion, setOccasion] = useState("personal");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [notes, setNotes] = useState("");
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [photoFileName, setPhotoFileName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [orderId, setOrderId] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedTier = SIZE_TIERS.find((t) => t.id === selectedSize)!;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (JPEG, PNG, or WebP)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image too large. Please use an image under 10MB.");
      return;
    }

    // Read as data URL (will be uploaded to GitHub on submit)
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPhotoDataUrl(result);
      setPhotoFileName(file.name);
      toast.success("Photo loaded — make sure it's clear and well-lit!");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName || !customerEmail) {
      toast.error("Please fill in your name and email");
      return;
    }

    if (!photoDataUrl) {
      toast.error("Please upload a clear reference photo");
      return;
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/custom-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerEmail,
          size: selectedTier.label,
          priceUSD: selectedTier.priceUSD,
          referencePhoto: photoDataUrl,
          notes,
          occasion,
          recipientName: occasion === "gift" ? recipientName : "",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit order");
      }

      setSubmitted(true);
      setOrderId(data.orderId || "");
      toast.success("Your order has been received!");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to submit order"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="pt-28 min-h-screen bg-cream flex items-center justify-center px-6 overflow-hidden relative">
        {/* Decorative background type */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 2 }}
          className="absolute -top-10 left-0 right-0 text-center pointer-events-none select-none"
        >
          <span className="font-display text-[20vw] leading-none text-brown-900/[0.03] tracking-tight">
            Thank You
          </span>
        </motion.div>

        <motion.div
          variants={staggerContainer(0.12, 0.2)}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-xl w-full text-center"
        >
          {/* Animated checkmark */}
          <motion.div
            variants={fadeUp}
            className="relative w-24 h-24 mx-auto mb-10"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
              className="w-24 h-24 bg-brown-800 rounded-full flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: "spring", stiffness: 300, damping: 20 }}
              >
                <Check className="h-12 w-12 text-cream" strokeWidth={1.5} />
              </motion.div>
            </motion.div>
            {/* Pulsing ring */}
            <motion.div
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              className="absolute inset-0 w-24 h-24 border-2 border-brown-800 rounded-full"
            />
          </motion.div>

          {/* Eyebrow */}
          <motion.div
            variants={fadeUp}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <span className="h-px w-8 bg-brown-400" />
            <span className="font-body text-[10px] tracking-luxe uppercase text-brown-500">
              Order Confirmed
            </span>
            <span className="h-px w-8 bg-brown-400" />
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={fadeUp}
            className="font-display text-4xl md:text-5xl text-brown-900 mb-4 leading-tight text-balance"
          >
            Your figure is
            <br />
            <span className="italic font-light text-brown-500">on its way</span> to
            being made.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            className="font-body text-base text-brown-700 leading-relaxed mb-2 font-light"
          >
            Thank you, {customerName}. We've received your order and your
            reference photo.
          </motion.p>
          <motion.p
            variants={fadeUp}
            className="font-body text-sm text-brown-500 mb-10 font-light"
          >
            We'll contact you at <strong className="text-brown-700">{customerEmail}</strong> to
            share progress and updates on your sculpture.
          </motion.p>

          {/* Order summary card */}
          <motion.div
            variants={fadeUp}
            className="bg-white border border-beige p-8 mb-10 text-left"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px flex-1 bg-beige" />
              <span className="font-body text-[10px] tracking-luxe uppercase text-brown-500">
                Order Summary
              </span>
              <span className="h-px flex-1 bg-beige" />
            </div>

            {/* Reference photo + details */}
            {photoDataUrl && (
              <div className="flex gap-4 mb-6">
                <div className="w-16 h-16 bg-beige-light overflow-hidden shrink-0">
                  <img
                    src={photoDataUrl}
                    alt="Reference"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display text-lg text-brown-900 leading-tight">
                    {selectedTier.label}
                  </div>
                  <div className="font-body text-[11px] text-brown-500 mt-0.5">
                    {selectedTier.dimensions}
                  </div>
                  {occasion === "gift" && recipientName && (
                    <div className="font-body text-[11px] text-brown-400 mt-0.5">
                      Gift for {recipientName}
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="price-num text-xl text-brown-800">
                    {formatPrice(selectedTier.priceUSD)}
                  </div>
                </div>
              </div>
            )}

            {/* Order ID */}
            <div className="flex items-center justify-between pt-4 border-t border-beige">
              <span className="font-body text-[10px] tracking-luxe uppercase text-brown-400">
                Order ID
              </span>
              <code className="font-mono text-xs text-brown-600">
                {orderId || "—"}
              </code>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between mt-2">
              <span className="font-body text-[10px] tracking-luxe uppercase text-brown-400">
                Status
              </span>
              <span className="inline-flex items-center gap-1.5 font-body text-[10px] tracking-luxe-sm uppercase text-amber-700">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                Pending
              </span>
            </div>
          </motion.div>

          {/* Timeline */}
          <motion.div
            variants={fadeUp}
            className="grid grid-cols-3 gap-2 mb-10"
          >
            {[
              { label: "Order", icon: "✓", active: true },
              { label: "Sculpting", icon: "02", active: false },
              { label: "Shipping", icon: "03", active: false },
            ].map((step, i) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.15, duration: 0.5 }}
                className={`p-4 border ${
                  step.active
                    ? "border-brown-800 bg-brown-50"
                    : "border-beige bg-white/50"
                }`}
              >
                <div
                  className={`font-display text-lg mb-1 ${
                    step.active ? "text-brown-800" : "text-brown-300"
                  }`}
                >
                  {step.icon}
                </div>
                <div
                  className={`font-body text-[9px] tracking-luxe-sm uppercase ${
                    step.active ? "text-brown-700" : "text-brown-400"
                  }`}
                >
                  {step.label}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Actions */}
          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <button
              onClick={() => {
                setSubmitted(false);
                setCustomerName("");
                setCustomerEmail("");
                setRecipientName("");
                setNotes("");
                setPhotoDataUrl(null);
                setPhotoFileName("");
                setOrderId("");
                setSelectedSize("medium");
                setOccasion("personal");
              }}
              className="inline-flex items-center gap-3 bg-brown-800 text-cream px-8 py-4 font-body text-xs tracking-luxe-sm uppercase hover:bg-brown-900 transition-colors"
            >
              Place Another Order
            </button>
            <button
              onClick={() => {
                window.location.hash = "#home";
              }}
              className="inline-flex items-center gap-3 border border-brown-700 text-brown-800 px-8 py-4 font-body text-xs tracking-luxe-sm uppercase hover:bg-brown-800 hover:text-cream transition-colors"
            >
              Back to Store
            </button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-cream">
      {/* ============================================================
          HERO SECTION — looped background video
          ============================================================ */}
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden flex items-center justify-center">
        {/* Looped background video */}
        <video
          src="/videos/custom-clay-figures-loop.mp4"
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-brown-900/50" />
        <div className="absolute inset-0 grain-overlay" />

        {/* Content */}
        <motion.div
          variants={staggerContainer(0.15, 0.3)}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-3xl mx-auto px-6 text-center"
        >
          <motion.div
            variants={fadeUp}
            className="flex items-center justify-center gap-4 mb-6"
          >
            <span className="h-px w-12 bg-beige/60" />
            <span className="font-body text-[11px] tracking-luxe uppercase text-beige/80">
              Bespoke · Made to order · One of a kind
            </span>
            <span className="h-px w-12 bg-beige/60" />
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="font-display text-5xl sm:text-6xl md:text-7xl text-cream leading-[1.02] mb-6 text-balance"
          >
            Custom Clay
            <br />
            <span className="italic font-light text-beige">Figures</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="max-w-xl mx-auto font-body text-base text-cream/80 leading-relaxed font-light mb-8"
          >
            Turn a photo into a sculpted clay figure. A unique gift for
            loved ones, a memorial keepsake, or a personal treasure. Each piece
            is made to order with attention to every detail.
          </motion.p>
        </motion.div>
      </section>

      {/* ============================================================
          HOW IT WORKS
          ============================================================ */}
      <section className="py-20 md:py-28 px-6 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <motion.div
            variants={staggerContainer(0.12, 0.1)}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            <motion.div variants={fadeUp} className="text-center mb-16">
              <span className="font-body text-[11px] tracking-luxe uppercase text-brown-500">
                How It Works
              </span>
              <h2 className="font-display text-4xl md:text-5xl text-brown-900 mt-4">
                Three simple steps
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  num: "01",
                  title: "Upload a Photo",
                  desc: "Choose a clear, well-lit photo of the person you want sculpted. Front-facing works best.",
                },
                {
                  num: "02",
                  title: "Pick a Size",
                  desc: "Select from Small, Medium, Large, or Duo. Each size includes different levels of detail.",
                },
                {
                  num: "03",
                  title: "We Sculpt & Ship",
                  desc: "Your figure is sculpted in clay, fired, and shipped to your door in 2–3 weeks.",
                },
              ].map((step, i) => (
                <motion.div
                  key={step.num}
                  variants={fadeUp}
                  className="bg-white border border-beige p-8"
                >
                  <span className="font-display text-3xl text-brown-300">
                    {step.num}
                  </span>
                  <h3 className="font-display text-2xl text-brown-900 mt-4 mb-3">
                    {step.title}
                  </h3>
                  <p className="font-body text-sm text-brown-600 leading-relaxed font-light">
                    {step.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          ORDER FORM
          ============================================================ */}
      <section className="py-20 md:py-28 px-6 lg:px-12 bg-brown-50/50">
        <div className="mx-auto max-w-3xl">
          <motion.div
            variants={staggerContainer(0.12, 0.1)}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="mb-12 text-center"
          >
            <motion.span
              variants={fadeUp}
              className="font-body text-[11px] tracking-luxe uppercase text-brown-500"
            >
              Place Your Order
            </motion.span>
            <motion.h2
              variants={fadeUp}
              className="font-display text-4xl md:text-5xl text-brown-900 mt-4 mb-4"
            >
              Create your figure
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="font-body text-sm text-brown-600 font-light max-w-xl mx-auto"
            >
              Fill in the details below. We'll review your photo and contact you
              within 24 hours to confirm.
            </motion.p>
          </motion.div>

          <motion.form
            variants={fadeUp}
            onSubmit={handleSubmit}
            className="bg-white border border-beige p-8 md:p-10 space-y-8"
          >
            {/* Step 1: Upload Reference Photo (matches "How It Works" 01) */}
            <div>
              <h3 className="font-display text-xl text-brown-900 mb-1">
                1. Upload a Photo *
              </h3>
              <p className="font-body text-[11px] text-brown-500 mb-4">
                A clear, front-facing photo with good lighting. This is the
                reference our sculptor will work from.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />

              {photoDataUrl ? (
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-beige-light overflow-hidden shrink-0 border border-beige">
                    <img
                      src={photoDataUrl}
                      alt="Reference"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-body text-sm text-brown-900">
                      {photoFileName}
                    </div>
                    <div className="font-body text-[10px] text-green-700 flex items-center gap-1 mt-1">
                      <Check className="h-3 w-3" /> Photo loaded
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoDataUrl(null);
                      setPhotoFileName("");
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="font-body text-[10px] tracking-luxe-sm uppercase text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-brown-300 hover:border-brown-700 hover:bg-brown-50 transition-colors p-8 flex flex-col items-center gap-3"
                >
                  <Upload className="h-6 w-6 text-brown-400" strokeWidth={1.4} />
                  <span className="font-body text-xs tracking-luxe-sm uppercase text-brown-500">
                    Click to Upload Photo
                  </span>
                  <span className="font-body text-[10px] text-brown-400">
                    JPG, PNG, or WebP — max 10MB
                  </span>
                </button>
              )}

              {/* Photo tips */}
              <div className="mt-3 bg-brown-50/60 border border-beige p-3">
                <p className="font-body text-[10px] text-brown-500 leading-relaxed">
                  💡 <strong>Tips for best results:</strong> Use natural lighting,
                  face the camera directly, avoid shadows on the face, include
                  the shoulders. Multiple angles can be described in the notes.
                </p>
              </div>
            </div>

            {/* Step 2: Size selection (matches "How It Works" 02) */}
            <div>
              <h3 className="font-display text-xl text-brown-900 mb-1">
                2. Pick a Size
              </h3>
              <p className="font-body text-[11px] text-brown-500 mb-4">
                Price includes sculpting, firing, and painting.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SIZE_TIERS.map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setSelectedSize(tier.id)}
                    className={`relative text-left p-4 border-2 transition-all ${
                      selectedSize === tier.id
                        ? "border-brown-800 bg-brown-50"
                        : "border-beige hover:border-brown-300"
                    }`}
                  >
                    {tier.popular && (
                      <span className="absolute top-2 right-2 font-body text-[8px] tracking-luxe-sm uppercase bg-brown-800 text-cream px-2 py-0.5">
                        Popular
                      </span>
                    )}
                    <div className="font-display text-lg text-brown-900">
                      {tier.label}
                    </div>
                    <div className="font-body text-[11px] text-brown-500 mb-1">
                      {tier.dimensions}
                    </div>
                    <div className="price-num text-xl text-brown-800">
                      {formatPrice(tier.priceUSD)}
                    </div>
                    <div className="font-body text-[10px] text-brown-400 mt-1">
                      {tier.details}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Occasion */}
            <div>
              <h3 className="font-display text-xl text-brown-900 mb-1">
                3. What's the occasion?
              </h3>
              <p className="font-body text-[11px] text-brown-500 mb-4">
                This helps us tailor the sculpture to your needs.
              </p>
              <div className="flex flex-wrap gap-2">
                {OCCASIONS.map((occ) => {
                  const Icon = occ.icon;
                  return (
                    <button
                      key={occ.id}
                      type="button"
                      onClick={() => setOccasion(occ.id)}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 border-2 transition-all ${
                        occasion === occ.id
                          ? "border-brown-800 bg-brown-50 text-brown-900"
                          : "border-beige text-brown-500 hover:border-brown-300"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" strokeWidth={1.4} />
                      <span className="font-body text-xs">{occ.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 4: Contact info */}
            <div>
              <h3 className="font-display text-xl text-brown-900 mb-1">
                4. Your Details
              </h3>
              <p className="font-body text-[11px] text-brown-500 mb-4">
                So we can contact you about your order.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-body text-[10px] tracking-luxe uppercase text-brown-600 block mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Jane Doe"
                    required
                    className="w-full bg-white border border-beige px-4 py-3 font-body text-sm text-brown-900 placeholder:text-brown-400 focus:outline-none focus:border-brown-700"
                  />
                </div>
                <div>
                  <label className="font-body text-[10px] tracking-luxe uppercase text-brown-600 block mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="jane@email.com"
                    required
                    className="w-full bg-white border border-beige px-4 py-3 font-body text-sm text-brown-900 placeholder:text-brown-400 focus:outline-none focus:border-brown-700"
                  />
                </div>
              </div>

              {occasion === "gift" && (
                <div className="mt-4">
                  <label className="font-body text-[10px] tracking-luxe uppercase text-brown-600 block mb-2">
                    Recipient's Name (who is it for?)
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="John Smith"
                    className="w-full bg-white border border-beige px-4 py-3 font-body text-sm text-brown-900 placeholder:text-brown-400 focus:outline-none focus:border-brown-700"
                  />
                </div>
              )}

              <div className="mt-4">
                <label className="font-body text-[10px] tracking-luxe uppercase text-brown-600 block mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any specific details — outfit, colors, pose, accessories, special requests…"
                  rows={3}
                  className="w-full bg-white border border-beige px-4 py-3 font-body text-sm text-brown-900 placeholder:text-brown-400 focus:outline-none focus:border-brown-700 resize-none"
                />
              </div>
            </div>

            {/* Order summary + submit */}
            <div className="border-t border-beige pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-body text-[10px] tracking-luxe uppercase text-brown-500">
                    {selectedTier.label} · {selectedTier.dimensions}
                  </div>
                  <div className="font-display text-2xl text-brown-900">
                    Total
                  </div>
                </div>
                <span className="price-num text-3xl text-brown-800">
                  {formatPrice(selectedTier.priceUSD)}
                </span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-shine w-full inline-flex items-center justify-center gap-3 bg-brown-800 text-cream px-8 py-4 font-body text-xs tracking-luxe-sm uppercase hover:bg-brown-900 disabled:opacity-60 transition-colors"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    Submit Order
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>

              <p className="font-body text-[10px] text-brown-400 text-center mt-3 font-light">
                By submitting, you agree to be contacted about your custom
                clay figure order.
              </p>
            </div>
          </motion.form>
        </div>
      </section>
    </div>
  );
}
