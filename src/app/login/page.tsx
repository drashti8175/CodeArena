"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { signInWithEmail, signInWithGoogle, getAuthErrorMessage } from "@/lib/firebase/auth";
import { AuthError } from "firebase/auth";
import { useAuth } from "@/store/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { arenaUser, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && arenaUser) router.replace("/dashboard");
  }, [arenaUser, loading, router]);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim()) { setError("Email is required."); return; }
    if (!password) { setError("Password is required."); return; }

    setSubmitting(true);
    try {
      await signInWithEmail(email.trim(), password);
      setSuccess("Login successful! Redirecting...");
      router.push("/dashboard");
    } catch (err) {
      setError(getAuthErrorMessage(err as AuthError));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      setSuccess("Signed in with Google! Redirecting...");
      router.push("/dashboard");
    } catch (err) {
      setError(getAuthErrorMessage(err as AuthError));
    } finally {
      setGoogleLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[50%] relative bg-[#0d0d14] flex-col justify-between p-12 overflow-hidden border-r border-[#2a2a3a]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_30%_40%,rgba(245,158,11,0.1),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:48px_48px]" />

        <div className="relative flex items-center gap-3">
          <span className="text-3xl">⚔️</span>
          <span className="text-2xl font-black bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">CodeArena</span>
        </div>

        <div className="relative space-y-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <h1 className="text-5xl font-black text-white leading-tight mb-4">
              Welcome<br />
              <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 bg-clip-text text-transparent">
                back, hero
              </span>
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed">
              Your XP, streaks, and rank are waiting. Continue your journey to Legend.
            </p>
          </motion.div>

          <div className="space-y-3">
            {[
              { icon: "🔒", text: "Real authentication — your account is secure" },
              { icon: "🌐", text: "Sign in with Google — one click access" },
              { icon: "📧", text: "Login alerts sent to your email" },
              { icon: "🏆", text: "Your progress is saved to the cloud" },
            ].map(({ icon, text }, i) => (
              <motion.div key={text} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3 text-sm text-gray-400">
                <span className="text-lg">{icon}</span>{text}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative grid grid-cols-3 gap-3">
          {[{ value: "12+", label: "Problems" }, { value: "5", label: "Rank Tiers" }, { value: "Real", label: "Auth" }].map(({ value, label }) => (
            <div key={label} className="bg-[#1e1e2a] border border-[#2a2a3a] rounded-xl p-3 text-center">
              <div className="text-lg font-black text-yellow-400">{value}</div>
              <div className="text-xs text-gray-500">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#0a0a0f]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <span className="text-2xl">⚔️</span>
            <span className="text-xl font-black bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">CodeArena</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-black text-white mb-1">Sign in to your account</h2>
            <p className="text-gray-500 text-sm">Enter your real credentials to access your arena</p>
          </div>

          {/* Google Sign In */}
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            onClick={handleGoogleLogin} disabled={googleLoading || submitting}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 text-gray-800 font-semibold rounded-xl text-sm transition-all shadow-sm disabled:opacity-60 border border-gray-200 mb-4">
            {googleLoading ? (
              <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            {googleLoading ? "Opening Google..." : "Continue with Google"}
          </motion.button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-[#2a2a3a]" />
            <span className="text-xs text-gray-600 font-medium">OR</span>
            <div className="flex-1 h-px bg-[#2a2a3a]" />
          </div>

          {/* Email form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(""); }}
                  placeholder="you@example.com" autoComplete="email"
                  className="w-full bg-[#16161f] border border-[#2a2a3a] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/10 transition-all" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-300">Password</label>
                <Link href="/forgot-password" className="text-xs text-yellow-400 hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type={showPass ? "text" : "password"} value={password} onChange={e => { setPassword(e.target.value); setError(""); }}
                  placeholder="••••••••" autoComplete="current-password"
                  className="w-full bg-[#16161f] border border-[#2a2a3a] rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/10 transition-all" />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error / Success messages */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-start gap-2.5 text-red-400 text-sm bg-red-900/20 border border-red-500/25 rounded-xl px-4 py-3">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}
              {success && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2.5 text-green-400 text-sm bg-green-900/20 border border-green-500/25 rounded-xl px-4 py-3">
                  <CheckCircle2 size={16} className="shrink-0" />
                  <span>{success}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              type="submit" disabled={submitting || googleLoading}
              className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60 hover:shadow-lg hover:shadow-orange-500/20 transition-all">
              {submitting ? (
                <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Signing in...</>
              ) : (
                <>Sign In <ArrowRight size={15} /></>
              )}
            </motion.button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-yellow-400 hover:text-yellow-300 font-semibold hover:underline transition-colors">
              Create one free
            </Link>
          </p>

          <p className="text-center text-xs text-gray-700 mt-3">
            Wrong password = access denied. Your account is protected.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
