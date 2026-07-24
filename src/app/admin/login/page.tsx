"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Mail, ArrowRight, Shield, Eye, EyeOff } from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/animations";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<"invalid" | "blocked" | "server" | null>(null);
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
    setErrorType(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data?.error || "Login failed";
        setError(msg);
        if (res.status === 429) {
          setErrorType("blocked");
        } else if (res.status === 401) {
          setErrorType("invalid");
        } else {
          setErrorType("server");
        }
        setLoading(false);
        return;
      }
      // Success — redirect
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Network error. Please check your connection and try again.");
      setErrorType("server");
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
            Authorized access only
          </p>
        </motion.div>

        <motion.form
          variants={fadeUp}
          onSubmit={handleSubmit}
          className="bg-cream text-brown-900 p-8 space-y-6"
          autoComplete="off"
        >
          {error && (
            <div
              className={`border px-4 py-3 font-body text-sm ${
                errorType === "blocked"
                  ? "border-amber-400 bg-amber-50 text-amber-900"
                  : errorType === "invalid"
                  ? "border-red-300 bg-red-50 text-red-800"
                  : "border-orange-300 bg-orange-50 text-orange-900"
              }`}
            >
              <div className="font-medium mb-1">
                {errorType === "invalid" && "Wrong email or password"}
                {errorType === "blocked" && "Temporarily blocked"}
                {errorType === "server" && "Server error"}
              </div>
              <div className="text-xs opacity-90">{error}</div>
              {errorType === "invalid" && (
                <div className="text-xs mt-2 opacity-80 leading-relaxed">
                  Please check:
                  <ul className="list-disc list-inside mt-1 space-y-0.5">
                    <li>Email is spelled correctly (case-insensitive)</li>
                    <li>Password is exact — including <code className="bg-brown-100 px-1">:</code> and <code className="bg-brown-100 px-1">/</code></li>
                    <li>No leading/trailing spaces</li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Email — NO prefill, user must type it */}
          <div>
            <label htmlFor="admin-email" className="font-body text-[10px] tracking-luxe uppercase text-brown-600 block mb-3">
              Email
            </label>
            <div className="flex items-center border-b border-brown-300 focus-within:border-brown-800 transition-colors">
              <Mail className="h-4 w-4 text-brown-500 mr-3" strokeWidth={1.4} />
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="username"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                required
                className="flex-1 bg-transparent font-body text-base text-brown-900 placeholder:text-brown-400 py-3 focus:outline-none"
              />
            </div>
          </div>

          {/* Password — NO prefill, with show/hide toggle */}
          <div>
            <label htmlFor="admin-password" className="font-body text-[10px] tracking-luxe uppercase text-brown-600 block mb-3">
              Password
            </label>
            <div className="flex items-center border-b border-brown-300 focus-within:border-brown-800 transition-colors">
              <Lock className="h-4 w-4 text-brown-500 mr-3" strokeWidth={1.4} />
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                autoComplete="current-password"
                required
                className="flex-1 bg-transparent font-body text-base text-brown-900 placeholder:text-brown-400 py-3 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="p-1 text-brown-500 hover:text-brown-800 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" strokeWidth={1.4} />
                ) : (
                  <Eye className="h-4 w-4" strokeWidth={1.4} />
                )}
              </button>
            </div>
            <p className="font-body text-[10px] text-brown-500 mt-2 font-light">
              Tip: use the eye icon to verify what you typed.
            </p>
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
        </motion.form>

        {/* Security notice */}
        <motion.div
          variants={fadeUp}
          className="mt-8 flex items-center justify-center gap-2 font-body text-[10px] tracking-luxe-sm uppercase text-beige/40"
        >
          <Shield className="h-3 w-3" strokeWidth={1.5} />
          <span>Protected · Rate-limited · Encrypted session</span>
        </motion.div>

        <motion.p
          variants={fadeUp}
          className="text-center mt-6 font-body text-[11px] text-beige/50 font-light"
        >
          <a href="/" className="hover:text-beige transition-colors">
            ← Back to store
          </a>
        </motion.p>
      </motion.div>
    </div>
  );
}
