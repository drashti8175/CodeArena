"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Mail, AlertCircle, Loader2, CheckCircle2, LogOut } from "lucide-react";
import { useAuth } from "@/store/AuthContext";
import { resendVerificationEmail, refreshCurrentUser, signOut } from "@/lib/firebase/auth";

export default function EmailVerificationGate() {
  const router = useRouter();
  const { firebaseUser, arenaUser, loading } = useAuth();
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [avatar, setAvatar] = useState("🐉");
  const AVATARS = ["🐉", "🦉", "🧙", "🦅", "⚔️", "🛡️", "⚡", "🥷", "🎭", "🦊", "🐺", "🦁", "🐯", "🦄", "🤖", "👾"];

  // Skip the gate if Google user or if email is verified AND profile exists
  const isGoogleUser = arenaUser?.provider === "google";

  // If they are verified but don't have a profile yet, they stay in this component
  // to pick their avatar.
  const isFullyVerified = isGoogleUser || (firebaseUser?.emailVerified && arenaUser);

  // Poll Firebase every 3 seconds to auto-detect when verification completes in another tab
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (firebaseUser && !firebaseUser.emailVerified) {
      interval = setInterval(async () => {
        try {
          await firebaseUser.reload();
          // After reload, fetch currentUser from auth (force the singleton refresh)
          const { auth } = await import("@/lib/firebase/config");
          if (auth.currentUser?.emailVerified) {
            if (!arenaUser) {
              setShowAvatarPicker(true);
            } else {
              window.location.reload();
            }
          }
        } catch (err) {
          // ignore network errors on poll
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [firebaseUser, arenaUser]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0a0a0f] flex items-center justify-center p-6">
        <Loader2 size={32} className="animate-spin text-yellow-500" />
      </div>
    );
  }

  if (!firebaseUser) return null;
  if (isFullyVerified) return null;

  async function handleResend() {
    if (!firebaseUser?.email) return;
    setSending(true);
    setError("");
    setMessage("");
    try {
      await resendVerificationEmail();
      setMessage("Verification email sent! Check your inbox (and spam folder).");
    } catch {
      setError("Could not send the email. Please try again in a few minutes.");
    } finally {
      setSending(false);
    }
  }

  async function handleRefresh() {
    setChecking(true);
    setError("");
    try {
      await refreshCurrentUser();

      const { auth } = await import("@/lib/firebase/config");
      const user = auth.currentUser;

      if (user?.emailVerified) {
        // If verified, check if they need an avatar (arenaUser is missing)
        if (!arenaUser) {
          setShowAvatarPicker(true);
          setChecking(false);
        } else {
          window.location.reload();
        }
      } else {
        setError("Your email is not verified yet. Please check your inbox and click the verification link.");
        setChecking(false);
      }
    } catch {
      setError("Could not refresh status. Please try again.");
      setChecking(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  async function handleFinalize() {
    setChecking(true);
    setError("");
    try {
      const { finalizeEmailSignup } = await import("@/lib/firebase/auth");
      await finalizeEmailSignup(avatar);
      // Wait a moment for auth context to pick up the changes
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Failed to create profile.");
      setChecking(false);
    }
  }

  if (showAvatarPicker && !arenaUser) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0a0a0f] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-[#0d0d14] border border-yellow-500/30 rounded-2xl p-8 shadow-2xl"
        >
          <h1 className="text-2xl font-black text-white text-center mb-2">Welcome to CodeArena!</h1>
          <p className="text-gray-400 text-sm text-center mb-6">
            Your email is verified. Pick your avatar to continue.
          </p>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-6">
            {AVATARS.map(a => (
              <motion.button key={a} type="button" whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.95 }}
                onClick={() => setAvatar(a)}
                className={`text-2xl p-2 rounded-xl border-2 transition-all ${avatar === a ? "border-yellow-500 bg-yellow-500/15 shadow-lg shadow-yellow-500/20" : "border-[#2a2a3a] hover:border-[#3a3a4a] bg-[#16161f]"}`}>
                {a}
              </motion.button>
            ))}
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-900/20 border border-red-500/30 rounded-xl p-3 mb-4 text-sm text-red-300">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />{error}
            </div>
          )}

          <button onClick={handleFinalize} disabled={checking}
            className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black rounded-xl text-sm flex items-center justify-center gap-2">
            {checking ? <><Loader2 size={15} className="animate-spin" /> Setting up...</> : "Join the Arena 🚀"}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0f] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#0d0d14] border border-yellow-500/30 rounded-2xl p-8 shadow-2xl"
      >
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center">
            <Mail size={28} className="text-yellow-400" />
          </div>
        </div>

        <h1 className="text-2xl font-black text-white text-center mb-2">Verify your email</h1>
        <p className="text-gray-400 text-sm text-center mb-6">
          We sent a verification link to{" "}
          <span className="text-yellow-400 font-mono">{firebaseUser?.email}</span>.
          <br />
          Click the link to activate your account. (Check your spam folder too!)
        </p>

        {message && (
          <div className="flex items-start gap-2 bg-green-900/20 border border-green-500/30 rounded-xl p-3 mb-4 text-sm text-green-300">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5" />{message}
          </div>
        )}
        {error && (
          <div className="flex items-start gap-2 bg-red-900/20 border border-red-500/30 rounded-xl p-3 mb-4 text-sm text-red-300">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />{error}
          </div>
        )}

        <div className="space-y-3">
          <button onClick={handleRefresh} disabled={checking}
            className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60 hover:shadow-lg hover:shadow-orange-500/20 transition-all">
            {checking ? <><Loader2 size={15} className="animate-spin" /> Checking...</> : "I've verified — let me in"}
          </button>
          <button onClick={handleResend} disabled={sending}
            className="w-full py-3 bg-[#16161f] border border-[#2a2a3a] text-gray-300 font-semibold rounded-xl text-sm hover:bg-[#1e1e2a] transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
            {sending ? <><Loader2 size={15} className="animate-spin" /> Sending...</> : "Resend verification email"}
          </button>
          <button onClick={handleSignOut}
            className="w-full py-2 text-gray-500 text-xs hover:text-red-400 transition-colors flex items-center justify-center gap-1.5">
            <LogOut size={12} /> Sign out
          </button>
        </div>
      </motion.div>
    </div>
  );
}
