"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Mail, AlertCircle, Loader2, CheckCircle2, LogOut } from "lucide-react";
import { useAuth } from "@/store/AuthContext";
import { resendVerificationEmail, refreshCurrentUser, signOut } from "@/lib/firebase/auth";

export default function EmailVerificationGate() {
  const router = useRouter();
  const { firebaseUser, arenaUser } = useAuth();
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Skip the gate for Google sign-in (Google already verifies emails)
  const isGoogleUser = arenaUser?.provider === "google";
  const isVerified = firebaseUser?.emailVerified || isGoogleUser;

  if (isVerified) return null;

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
      // Force a reload by navigating away and back
      window.location.reload();
    } catch {
      setError("Could not refresh status. Please try again.");
      setChecking(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-6">
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
          Click the link to activate your account.
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
