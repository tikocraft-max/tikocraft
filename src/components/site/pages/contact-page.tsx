"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Mail, MapPin, Clock, Send } from "lucide-react";
import SectionHeading from "../section-heading";
import {
  fadeUp,
  staggerContainer,
  revealLeft,
  revealRight,
  viewportOnce,
  easeLuxe,
} from "@/lib/animations";
import { toast } from "sonner";

const contactInfo = [
  {
    icon: Mail,
    label: "Email",
    value: "contact@wenov8.online",
  },
  {
    icon: MapPin,
    label: "Legal Business Address",
    value:
      "30 N Gould St Ste N\nSheridan, WY 82801\nUnited States",
  },
  {
    icon: Clock,
    label: "Support Hours",
    value: "Monday — Friday\n24 — 48 hour reply",
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "General enquiry",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in your name, email, and message.");
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1100));
    setSubmitting(false);
    toast.success("Thank you. We'll write back within two working days.");
    setForm({ name: "", email: "", subject: "General enquiry", message: "" });
  };

  return (
    <div className="bg-brown-900 text-cream min-h-screen pt-32 md:pt-40 px-6 lg:px-12 grain-overlay overflow-hidden">
      {/* Decorative background type */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, ease: easeLuxe }}
        className="absolute -top-10 left-0 right-0 text-center pointer-events-none select-none"
      >
        <span className="font-display text-[18vw] md:text-[14vw] leading-none text-cream/[0.04] tracking-tight">
          Tikocraft
        </span>
      </motion.div>

      <div className="relative mx-auto max-w-7xl pb-24 md:pb-32">
        {/* Intro */}
        <div className="mb-20">
          <SectionHeading
            eyebrow="Write to Us"
            light
            title={
              <>
                A letter, a visit,
                <br />
                <span className="italic font-light text-beige">a slow hello.</span>
              </>
            }
            description="Whether you are commissioning a piece, asking about a book nook kit, or checking on an order — we read every message and write back within two working days."
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left — contact details */}
          <motion.div
            variants={revealLeft}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="lg:col-span-5"
          >
            <motion.div
              variants={staggerContainer(0.1, 0.1)}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              className="space-y-10"
            >
              {contactInfo.map((info) => {
                const Icon = info.icon;
                return (
                  <motion.div
                    key={info.label}
                    variants={fadeUp}
                    className="flex gap-5 group"
                  >
                    <div className="shrink-0 w-12 h-12 border border-beige/30 flex items-center justify-center transition-colors duration-500 group-hover:border-beige group-hover:bg-beige/10">
                      <Icon className="h-5 w-5 text-beige" strokeWidth={1.2} />
                    </div>
                    <div>
                      <div className="font-body text-[10px] tracking-luxe uppercase text-beige/60 mb-2">
                        {info.label}
                      </div>
                      <div className="font-display text-lg text-cream whitespace-pre-line leading-snug">
                        {info.value}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            <motion.blockquote
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              className="mt-16 pt-10 border-t border-beige/20"
            >
              <p className="font-display text-2xl italic text-beige/90 leading-relaxed mb-4">
                &ldquo;The objects we live with should outlast the rooms we put them
                in.&rdquo;
              </p>
              <cite className="font-body text-xs tracking-luxe-sm uppercase text-beige/60 not-italic">
                — Yasmine Tiko, founder
              </cite>
            </motion.blockquote>
          </motion.div>

          {/* Right — Form */}
          <motion.div
            variants={revealRight}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="lg:col-span-7 lg:pl-8"
          >
            <form
              onSubmit={handleSubmit}
              className="bg-cream text-brown-900 p-8 md:p-12 space-y-8"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <Field
                  label="Your Name"
                  type="text"
                  value={form.name}
                  onChange={(v) => setForm({ ...form, name: v })}
                  placeholder="Yasmine R."
                />
                <Field
                  label="Email Address"
                  type="email"
                  value={form.email}
                  onChange={(v) => setForm({ ...form, email: v })}
                  placeholder="you@email.com"
                />
              </div>

              <div>
                <label className="font-body text-[10px] tracking-luxe uppercase text-brown-600 block mb-3">
                  Subject
                </label>
                <div className="flex flex-wrap gap-3">
                  {[
                    "General enquiry",
                    "Custom figure order",
                    "Book nook kits",
                    "Order support",
                  ].map((subject) => (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => setForm({ ...form, subject })}
                      className={`font-body text-[11px] tracking-luxe-sm uppercase px-4 py-2 border transition-all duration-300 ${
                        form.subject === subject
                          ? "bg-brown-800 text-cream border-brown-800"
                          : "border-brown-300 text-brown-700 hover:border-brown-700"
                      }`}
                    >
                      {subject}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-body text-[10px] tracking-luxe uppercase text-brown-600 block mb-3">
                  Your Message
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={5}
                  placeholder="Tell us what you have in mind…"
                  className="w-full bg-transparent border-b border-brown-300 font-body text-base text-brown-900 placeholder:text-brown-400 py-3 focus:outline-none focus:border-brown-800 transition-colors duration-300 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="group inline-flex items-center gap-3 bg-brown-800 text-cream px-8 py-4 font-body text-xs tracking-luxe-sm uppercase transition-all duration-500 hover:bg-brown-900 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <span className="inline-block h-3 w-3 border border-cream/40 border-t-cream rounded-full animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    Send Letter
                    <Send className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1" />
                  </>
                )}
              </button>

              <p className="font-body text-[11px] text-brown-500 font-light leading-relaxed">
                We reply within two working days. For custom figure orders,
                expect a longer conversation about your photo and preferences.
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="font-body text-[10px] tracking-luxe uppercase text-brown-600 block mb-3">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent border-b border-brown-300 font-body text-base text-brown-900 placeholder:text-brown-400 py-3 focus:outline-none focus:border-brown-800 transition-colors duration-300"
      />
    </div>
  );
}
