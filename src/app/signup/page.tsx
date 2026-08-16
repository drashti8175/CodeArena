"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail, Lock, Eye, EyeOff, User, ArrowRight,
  AlertCircle, CheckCircle2, Zap, ShieldCheck,
} from "lucide-react";
import { signUpWithEmail, getAuthErrorMessage } from "@/lib/firebase/auth";
import { signInWithPopup, getAdditionalUserInfo, User as FirebaseUser } from "firebase/auth";
import { auth, googleProvider, db } from "@/lib/firebase/config";
import { AuthError } from "firebase/auth";
import { useAuth } from "@/store/AuthContext";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { ArenaUser } from "@/lib/firebase/auth";

const AVATARS = ["🐉", "🦉", "🧙", "🦅", "⚔️", "🛡️", "⚡", "🥷", "🎭", "🦊", "🐺", "🦁", "🐯", "🦄", "🤖", "👾"];

const PASSWORD_RULES = [
  { label: "6+ characters", test: (p: string) => p.length >= 6 },
  { label: "Has a number", test: (p: string) => /\d/.test(p) },
  { label: "Has a letter", test: (p: string) => /[a-zA-Z]/.test(p) },
];

function sanitizeUsername(name: string): string {
  return name.replace(/[^a-zA-Z0-9_]/g, "_").slice(0, 20) || "ArenaHero";
}

export default function SignupPage() {
  const router = useRouter();
  const { arenaUser, loading } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);

  // Form fields
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [avatar, setAvatar] = useState("🐉");
  const [agreed, setAgreed] = useState(false);

  // Google flow — we store the authenticated Firebase user after popup
  const [googleFBUser, setGoogleFBUser] = useState<FirebaseUser | null>(null);
  const [googlePhotoURL, setGooglePhotoURL] = useState<string | null>(null);
  const [isGoogleFlow, setIsGoogleFlow] = useState(false);

  // UI
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState("");

  // Already logged in → go to dashboard
  useEffect(() => {
    if (!loading && arenaUser) router.replace("/dashboard");
  }, [arenaUser, loading, router]);

  // ── validation ────────────────────────────────────────────────────────────
  function validateUsername() {
    if (!username.trim()) return "Username is required.";
    if (username.length < 3) return "Username must be at least 3 characters.";
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return "Only letters, numbers, and underscores.";
    return "";
  }

  function validateStep1Email() {
    const e: Record<string, string> = {};
    const uErr = validateUsername();
    if (uErr) e.username = uErr;
    if (!email.trim()) e.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email address.";
    if (!password) e.password = "Password is required.";
    else if (password.length < 6) e.password = "Password must be at least 6 characters.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── STEP 1 submit — email/password ────────────────────────────────────────
  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!validateStep1Email()) return;
    if (!agreed) { setErrors({ agree: "You must agree to the terms." }); return; }

    setSubmitting(true);
    setErrors({});
    try {
      await signUpWithEmail(email.trim(), password, username.trim());
      setSuccess("Account created! Check your email (and spam folder) for the link. Redirecting…");
      setTimeout(() => router.push("/dashboard"), 1800);
    } catch (err: any) {
      setErrors({ submit: getAuthErrorMessage(err as AuthError) });
    } finally {
      setSubmitting(false);
    }
  }

  // ── Google — Step 1: open popup ONCE, pre-fill, show step 2 ──────────────
  async function handleGoogleClick() {
    setErrors({});
    setGoogleLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const info = getAdditionalUserInfo(cred);
      const fbUser = cred.user;

      // Check if this Google user already has a Firestore profile
      const existingSnap = await getDoc(doc(db, "users", fbUser.uid));
      if (existingSnap.exists()) {
        // Returning user — go straight to dashboard
        router.push("/dashboard");
        return;
      }

      if (!info?.isNewUser) {
        // Firebase knows them but no Firestore profile yet — handle below
      }

      // New user — store the authenticated user object and pre-fill fields
      setGoogleFBUser(fbUser);
      setGooglePhotoURL(fbUser.photoURL);
      setEmail(fbUser.email ?? "");
      setUsername(sanitizeUsername(fbUser.displayName ?? fbUser.email?.split("@")[0] ?? "ArenaHero"));
      setIsGoogleFlow(true);
      setStep(2); // advance to avatar picker
    } catch (err) {
      setErrors({ submit: getAuthErrorMessage(err as AuthError) });
    } finally {
      setGoogleLoading(false);
    }
  }

  // ── Google — Step 2: write Firestore profile (user already authenticated) ─
  async function handleGoogleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed) { setErrors({ agree: "You must agree to the terms." }); return; }
    const uErr = validateUsername();
    if (uErr) { setErrors({ username: uErr }); return; }
    if (!googleFBUser) { setErrors({ submit: "Session lost — please start over." }); return; }

    setSubmitting(true);
    setErrors({});
    try {
      const profile: ArenaUser = {
        uid: googleFBUser.uid,
        username: username.trim(),
        email: googleFBUser.email!,
        avatar,
        rank: "Bronze",
        level: 1,
        xp: 0,
        coins: 100,
        streak: 0,
        streakTheme: "fire",
        skills: {},
        solvedProblems: [],
        joinedAt: new Date().toISOString().split("T")[0],
        provider: "google",
      };

      // Write profile — user is authenticated (googleFBUser is the live Firebase user)
      await setDoc(doc(db, "users", googleFBUser.uid), {
        ...profile,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      });

      setSuccess("Arena profile created! Taking you to your dashboard…");
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err) {
      console.error("Firestore write error:", err);
      setErrors({ submit: getAuthErrorMessage(err as AuthError) });
    } finally {
      setSubmitting(false);
    }
  }

  // ── derived ───────────────────────────────────────────────────────────────
  const passStrength = PASSWORD_RULES.filter(r => r.test(password)).length;
  const strengthColor = ["bg-[#2a2a3a]", "bg-red-500", "bg-yellow-500", "bg-green-500"][passStrength];
  // the email form sub is handleEmailSignup natively in step 1 now
  const onFinalSubmit = handleGoogleSignup;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left decorative panel ─────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-[#0d0d14] flex-col justify-between p-12 overflow-hidden border-r border-[#2a2a3a]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_30%_40%,rgba(245,158,11,0.1),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:48px_48px]" />

        <div className="relative flex items-center gap-3">
          <span className="text-3xl">⚔️</span>
          <span className="text-2xl font-black bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">CodeArena</span>
        </div>

        <div className="relative space-y-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl font-black text-white leading-tight mb-4">
              Start your<br />
              <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 bg-clip-text text-transparent">
                coding journey
              </span>
            </h1>
            <p className="text-gray-400 text-lg">Real account. Real security. Your data is yours alone.</p>
          </motion.div>

          <div className="space-y-2.5">
            {[
              "Firebase Authentication — industry-grade security",
              "Wrong password = instant access denied",
              "Email verification required before login",
              "New device login alerts sent to your email",
            ].map(text => (
              <div key={text} className="flex items-center gap-2.5 text-sm text-gray-400">
                <ShieldCheck size={14} className="text-green-400 shrink-0" /><span>{text}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Progression path</p>
            {[
              { rank: "Bronze", xp: "Start here", icon: "🥉", color: "text-amber-600", active: true },
              { rank: "Silver", xp: "500 XP", icon: "🥈", color: "text-slate-400" },
              { rank: "Gold", xp: "1,500 XP", icon: "🥇", color: "text-yellow-400" },
              { rank: "Diamond", xp: "3,500 XP", icon: "💎", color: "text-cyan-400" },
              { rank: "Legend", xp: "7,000 XP", icon: "👑", color: "text-purple-400" },
            ].map(({ rank, xp, icon, color, active }, i) => (
              <motion.div key={rank}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.07 }}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all ${active ? "border-yellow-500/40 bg-yellow-500/10" : "border-[#2a2a3a] bg-[#16161f]/40"}`}>
                <span className="text-lg">{icon}</span>
                <span className={`font-bold text-sm ${color}`}>{rank}</span>
                <span className="text-xs text-gray-600 ml-auto">{xp}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center gap-2 text-sm text-gray-600">
          <CheckCircle2 size={14} className="text-green-400" /> Free forever · No credit card required
        </div>
      </div>

      {/* ── Right panel ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#0a0a0f] overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md py-6">

          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <span className="text-2xl">⚔️</span>
            <span className="text-xl font-black bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">CodeArena</span>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-8">
            {[1, 2].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-black" : "bg-[#1e1e2a] text-gray-500 border border-[#2a2a3a]"}`}>
                  {step > s ? <CheckCircle2 size={14} /> : s}
                </div>
                <span className={`text-xs font-medium ${step >= s ? "text-white" : "text-gray-600"}`}>
                  {s === 1 ? "Account" : "Avatar"}
                </span>
                {s < 2 && <div className={`w-8 h-px ${step > s ? "bg-yellow-500" : "bg-[#2a2a3a]"}`} />}
              </div>
            ))}
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-black text-white mb-1">
              {step === 1 ? "Create your account" : isGoogleFlow ? "Almost there! 🎉" : "Choose your hero"}
            </h2>
            <p className="text-gray-500 text-sm">
              {step === 1
                ? "Real credentials — secure and verified by Firebase"
                : isGoogleFlow
                  ? `Google account confirmed ✓ — customize your arena profile`
                  : "Pick an avatar that represents you in the arena"}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {/* ════ STEP 1 ════ */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>

                {/* Google button */}
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  onClick={handleGoogleClick} disabled={googleLoading || submitting}
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
                  {googleLoading ? "Opening Google…" : "Sign up with Google"}
                </motion.button>

                <div className="flex items-center gap-4 mb-5">
                  <div className="flex-1 h-px bg-[#2a2a3a]" />
                  <span className="text-xs text-gray-600">OR</span>
                  <div className="flex-1 h-px bg-[#2a2a3a]" />
                </div>

                {/* Email/password form */}
                <form onSubmit={handleEmailSignup} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Username</label>
                    <div className="relative">
                      <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input value={username} onChange={e => { setUsername(e.target.value); setErrors({}); }}
                        placeholder="DragonCoder" maxLength={20} autoComplete="username"
                        className={`w-full bg-[#16161f] border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 transition-all ${errors.username ? "border-red-500/60 focus:ring-red-500/10" : "border-[#2a2a3a] focus:border-yellow-500/50 focus:ring-yellow-500/10"}`} />
                    </div>
                    {errors.username && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.username}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Email address</label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input type="email" value={email} onChange={e => { setEmail(e.target.value); setErrors({}); }}
                        placeholder="you@example.com" autoComplete="email"
                        className={`w-full bg-[#16161f] border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 transition-all ${errors.email ? "border-red-500/60 focus:ring-red-500/10" : "border-[#2a2a3a] focus:border-yellow-500/50 focus:ring-yellow-500/10"}`} />
                    </div>
                    {errors.email && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input type={showPass ? "text" : "password"} value={password} onChange={e => { setPassword(e.target.value); setErrors({}); }}
                        placeholder="••••••••" autoComplete="new-password"
                        className={`w-full bg-[#16161f] border rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 transition-all ${errors.password ? "border-red-500/60 focus:ring-red-500/10" : "border-[#2a2a3a] focus:border-yellow-500/50 focus:ring-yellow-500/10"}`} />
                      <button type="button" onClick={() => setShowPass(v => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                        {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.password}</p>}
                    {password.length > 0 && (
                      <div className="mt-2">
                        <div className="flex gap-1 mb-1.5">
                          {[1, 2, 3].map(i => (
                            <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i <= passStrength ? strengthColor : "bg-[#2a2a3a]"}`} />
                          ))}
                        </div>
                        <div className="flex gap-3 flex-wrap">
                          {PASSWORD_RULES.map(r => (
                            <span key={r.label} className={`text-xs flex items-center gap-1 ${r.test(password) ? "text-green-400" : "text-gray-600"}`}>
                              <CheckCircle2 size={10} />{r.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <AnimatePresence>
                    {errors.submit && (
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="flex items-start gap-2.5 text-red-400 text-sm bg-red-900/20 border border-red-500/25 rounded-xl px-4 py-3">
                        <AlertCircle size={16} className="shrink-0 mt-0.5" />{errors.submit}
                      </motion.div>
                    )}
                    {success && (
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2.5 text-green-400 text-sm bg-green-900/20 border border-green-500/25 rounded-xl px-4 py-3">
                        <CheckCircle2 size={16} className="shrink-0" />{success}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Terms */}
                  <div className="flex items-start gap-3 mt-4 mb-2">
                    <button type="button" onClick={() => { setAgreed(v => !v); setErrors({}); }}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${agreed ? "bg-yellow-500 border-yellow-500" : "border-[#3a3a4a] hover:border-gray-500"}`}>
                      {agreed && <CheckCircle2 size={12} className="text-black" />}
                    </button>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      I agree to the <span className="text-yellow-400 cursor-pointer hover:underline">Terms of Service</span> and <span className="text-yellow-400 cursor-pointer hover:underline">Privacy Policy</span>
                    </p>
                  </div>
                  {errors.agree && <p className="text-red-400 text-xs flex items-center gap-1 mb-4"><AlertCircle size={11} />{errors.agree}</p>}

                  <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} type="submit"
                    disabled={submitting || success.length > 0}
                    className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                    {submitting ? "Signing up..." : <>Sign Up <ArrowRight size={15} /></>}
                  </motion.button>
                </form>
              </motion.div>
            )}

            {/* ════ STEP 2 ════ */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <form onSubmit={onFinalSubmit} className="space-y-5">

                  {/* Profile preview card */}
                  <div className="flex items-center gap-4 p-4 bg-[#16161f] border border-[#2a2a3a] rounded-xl">
                    {isGoogleFlow && googlePhotoURL ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={googlePhotoURL} alt="Google profile" referrerPolicy="no-referrer"
                        className="w-14 h-14 rounded-full border-2 border-yellow-500/40 shrink-0" />
                    ) : (
                      <div className="text-5xl shrink-0">{avatar}</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white truncate">{username || "Your Username"}</p>
                      <p className="text-gray-500 text-sm truncate">{email}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Zap size={11} className="text-yellow-400" />
                        <span className="text-xs text-yellow-400 font-semibold">Bronze · Level 1 · 100 coins</span>
                      </div>
                    </div>
                    {isGoogleFlow && (
                      <div className="shrink-0 flex items-center gap-1 text-xs text-green-400 bg-green-900/20 border border-green-500/30 px-2 py-1 rounded-full">
                        <ShieldCheck size={11} /> Verified
                      </div>
                    )}
                  </div>

                  {/* Username edit for Google flow */}
                  {isGoogleFlow && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">
                        Arena username
                        <span className="text-gray-600 font-normal ml-1">(auto-filled · edit if you want)</span>
                      </label>
                      <div className="relative">
                        <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input value={username} onChange={e => { setUsername(e.target.value); setErrors({}); }}
                          maxLength={20} placeholder="DragonCoder"
                          className={`w-full bg-[#16161f] border rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-1 transition-all ${errors.username ? "border-red-500/60 focus:ring-red-500/10" : "border-[#2a2a3a] focus:border-yellow-500/50 focus:ring-yellow-500/10"}`} />
                      </div>
                      {errors.username && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.username}</p>}
                    </div>
                  )}

                  {/* Avatar grid */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">Pick your arena avatar</label>
                    <div className="grid grid-cols-8 gap-2">
                      {AVATARS.map(a => (
                        <motion.button key={a} type="button" whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.95 }}
                          onClick={() => setAvatar(a)}
                          className={`text-2xl p-2 rounded-xl border-2 transition-all ${avatar === a ? "border-yellow-500 bg-yellow-500/15 shadow-lg shadow-yellow-500/20" : "border-[#2a2a3a] hover:border-[#3a3a4a] bg-[#16161f]"}`}>
                          {a}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="flex items-start gap-3">
                    <button type="button" onClick={() => { setAgreed(v => !v); setErrors({}); }}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${agreed ? "bg-yellow-500 border-yellow-500" : "border-[#3a3a4a] hover:border-gray-500"}`}>
                      {agreed && <CheckCircle2 size={12} className="text-black" />}
                    </button>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      I agree to the <span className="text-yellow-400 cursor-pointer hover:underline">Terms of Service</span> and <span className="text-yellow-400 cursor-pointer hover:underline">Privacy Policy</span>
                    </p>
                  </div>
                  {errors.agree && <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle size={11} />{errors.agree}</p>}

                  {/* Error / Success */}
                  <AnimatePresence>
                    {errors.submit && (
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="flex items-start gap-2.5 text-red-400 text-sm bg-red-900/20 border border-red-500/25 rounded-xl px-4 py-3">
                        <AlertCircle size={16} className="shrink-0 mt-0.5" />{errors.submit}
                      </motion.div>
                    )}
                    {success && (
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2.5 text-green-400 text-sm bg-green-900/20 border border-green-500/25 rounded-xl px-4 py-3">
                        <CheckCircle2 size={16} className="shrink-0" />{success}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex gap-3">
                    <button type="button"
                      onClick={() => { setStep(1); setIsGoogleFlow(false); setGoogleFBUser(null); }}
                      className="px-5 py-3 bg-[#16161f] border border-[#2a2a3a] text-gray-300 font-semibold rounded-xl text-sm hover:bg-[#1e1e2a] transition-colors">
                      Back
                    </button>
                    <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                      type="submit" disabled={submitting}
                      className="flex-1 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                      {submitting ? (
                        <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Creating profile…</>
                      ) : "Join the Arena 🚀"}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-yellow-400 hover:text-yellow-300 font-semibold hover:underline transition-colors">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
