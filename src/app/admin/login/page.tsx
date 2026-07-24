"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Mail, ArrowRight } from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/animations";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // If already logged in, redirect to dashboard
  useEffect(() => {
    fetch("/api/auth/session", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data?.admin) {
          router.replace("/admin");
        }
      })
      .catch(() => {});
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Login failed");
        setLoading(false);
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brown-900 text-cream grain-overlay flex items-center justify-center px-6">
      <motion.div
        variants={staggerContainer(0.12, 0.1)}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        {/* Logo */}
        <motion.div variants={fadeUp} className="text-center mb-12">
          <img
            src="/images/logo-cream.png"
            alt="Tikocraft"
            className="h-12 w-auto mx-auto mb-6"
          />
          <h1 className="font-display text-4xl text-cream mb-2">Admin</h1>
          <p className="font-body text-xs tracking-luxe uppercase text-beige/60">
            Sign in to manage your store
          </p>
        </motion.div>

        <motion.form
          variants={fadeUp}
          onSubmit={handleSubmit}
          className="bg-cream text-brown-900 p-8 space-y-6"
        >
          {error && (
            <div className="border border-red-300 bg-red-50 px-4 py-3 font-body text-sm text-red-800">
              {error}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="font-body text-[10px] tracking-luxe uppercase text-brown-600 block mb-3">
              Email
            </label>
            <div className="flex items-center border-b border-brown-300 focus-within:border-brown-800 transition-colors">
              <Mail className="h-4 w-4 text-brown-500 mr-3" strokeWidth={1.4} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@tikocraft.studio"
                autoComplete="email"
                required
                className="flex-1 bg-transparent font-body text-base text-brown-900 placeholder:text-brown-400 py-3 focus:outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="font-body text-[10px] tracking-luxe uppercase text-brown-600 block mb-3">
              Password
            </label>
            <div className="flex items-center border-b border-brown-300 focus-within:border-brown-800 transition-colors">
              <Lock className="h-4 w-4 text-brown-500 mr-3" strokeWidth={1.4} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                autoComplete="current-password"
                required
                className="flex-1 bg-transparent font-body text-base text-brown-900 placeholder:text-brown-400 py-3 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group inline-flex w-full items-center justify-center gap-3 bg-brown-800 text-cream px-8 py-4 font-body text-xs tracking-luxe-sm uppercase transition-all duration-500 hover:bg-brown-900 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in…
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1" />
              </>
            )}
          </button>

          <div className="font-body text-[11px] text-brown-500 font-light leading-relaxed text-center pt-2">
            <p className="mb-1">
              <span className="text-brown-700">Demo credentials</span>
            </p>
            <p>admin@tikocraft.studio</p>
            <p>tikocraft2026</p>
          </div>
        </motion.form>

        <motion.p
          variants={fadeUp}
          className="text-center mt-8 font-body text-[11px] text-beige/50 font-light"
        >
          <a href="/" className="hover:text-beige transition-colors">
            ← Back to store
          </a>
        </motion.p>
      </motion.div>
    </div>
  );
}
