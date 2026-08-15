"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Mail, ArrowRight, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { resetPassword } from "@/lib/firebase/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim()) { setError("Please enter your email address."); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError("Please enter a valid email."); return; }

    setSubmitting(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      // Always show a generic success-style message to prevent email enumeration
      if (code === "auth/user-not-found" || code === "auth/invalid-email") {
        setSent(true); // Don't reveal whether the email exists
      } else if (code === "auth/too-many-requests") {
        setError("Too many requests. Please wait a few minutes and try again.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#0d0d14] border border-[#2a2a3a] rounded-2xl p-8 shadow-2xl"
      >
        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-yellow-400 transition-colors mb-6">
          <ArrowLeft size={14} /> Back to sign in
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">🔑</span>
          <h1 className="text-2xl font-black text-white">Forgot password?</h1>
        </div>

        {sent ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex items-start gap-3 bg-green-900/20 border border-green-500/30 rounded-xl p-4">
              <CheckCircle2 size={18} className="text-green-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-green-300 text-sm font-semibold">Check your inbox</p>
                <p className="text-gray-400 text-sm mt-1">
                  If an account exists for <span className="text-white font-mono">{email}</span>,
                  we&apos;ve sent a password reset link. It expires in 1 hour.
                </p>
              </div>
            </div>
            <Link href="/login" className="block text-center py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black rounded-xl text-sm hover:shadow-lg hover:shadow-orange-500/20 transition-all">
              Return to sign in
            </Link>
          </motion.div>
        ) : (
          <>
            <p className="text-gray-400 text-sm mb-6">
              Enter the email you used to sign up. We&apos;ll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Email address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="email" value={email}
                    onChange={e => { setEmail(e.target.value); setError(""); }}
                    placeholder="you@example.com" autoComplete="email" required
                    className="w-full bg-[#16161f] border border-[#2a2a3a] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/10 transition-all"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 text-red-400 text-sm bg-red-900/20 border border-red-500/25 rounded-xl px-4 py-3">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                type="submit" disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60 hover:shadow-lg hover:shadow-orange-500/20 transition-all">
                {submitting ? (
                  <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Sending...</>
                ) : (
                  <>Send reset link <ArrowRight size={15} /></>
                )}
              </motion.button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
