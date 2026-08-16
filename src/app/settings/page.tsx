"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/store/AuthContext";
import { useGame } from "@/store/GameContext";
import { STREAK_THEMES, AVATARS_LIST } from "@/lib/data";
import { resetPassword } from "@/lib/firebase/auth";
import { db } from "@/lib/firebase/config";
import { doc, updateDoc } from "firebase/firestore";
import {
  User, Bell, Shield, Palette, Save, Flame, Lock, LogOut,
  CheckCircle2, AlertCircle, Loader2, Trash2, Key, Eye, EyeOff,
} from "lucide-react";
import clsx from "clsx";

type Section = "account" | "appearance" | "notifications" | "privacy" | "security";

const SECTIONS: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: "account", label: "Account", icon: User },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy", icon: Shield },
  { id: "security", label: "Security", icon: Lock },
];

const FONT_SIZES = [12, 13, 14, 15, 16, 18];

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle}
      className={clsx("relative w-11 h-6 rounded-full transition-colors duration-200", on ? "bg-yellow-500" : "bg-[#2a2a3a]")}>
      <span className={clsx("absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200", on ? "translate-x-5" : "translate-x-0.5")} />
    </button>
  );
}

function StatusMsg({ ok, msg }: { ok: boolean; msg: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className={clsx("flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm", ok
        ? "bg-green-900/20 border border-green-500/30 text-green-400"
        : "bg-red-900/20 border border-red-500/30 text-red-400")}>
      {ok ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}{msg}
    </motion.div>
  );
}

export default function SettingsPage() {
  const { arenaUser, firebaseUser, refreshProfile, signOut } = useAuth();
  const { user } = useGame();

  const [section, setSection] = useState<Section>("account");

  // ── Account ───────────────────────────────────────────────────
  const [username, setUsername] = useState(arenaUser?.username ?? user.username);
  const [selectedAvatar, setSelectedAvatar] = useState(arenaUser?.avatar ?? user.avatar);
  const [accountSaving, setAccountSaving] = useState(false);
  const [accountMsg, setAccountMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (arenaUser) { setUsername(arenaUser.username); setSelectedAvatar(arenaUser.avatar); }
  }, [arenaUser]);

  async function saveAccount() {
    if (!arenaUser?.uid) return;
    if (!username.trim() || username.length < 3) {
      setAccountMsg({ ok: false, text: "Username must be at least 3 characters." }); return;
    }
    setAccountSaving(true); setAccountMsg(null);
    try {
      await updateDoc(doc(db, "users", arenaUser.uid), {
        username: username.trim(),
        avatar: selectedAvatar,
      });
      await refreshProfile();
      setAccountMsg({ ok: true, text: "Profile saved successfully!" });
    } catch (err) {
      setAccountMsg({ ok: false, text: "Failed to save. Please try again." });
    } finally {
      setAccountSaving(false);
      setTimeout(() => setAccountMsg(null), 3000);
    }
  }

  // ── Appearance ────────────────────────────────────────────────
  const [streakTheme, setStreakTheme] = useState<string>(arenaUser?.streakTheme ?? "fire");
  const [fontSize, setFontSize] = useState(14);
  const [appearSaving, setAppearSaving] = useState(false);
  const [appearMsg, setAppearMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function saveAppearance() {
    if (!arenaUser?.uid) return;
    setAppearSaving(true); setAppearMsg(null);
    try {
      await updateDoc(doc(db, "users", arenaUser.uid), { streakTheme });
      // Save font size to localStorage (it's a client-only preference)
      localStorage.setItem("editor_font_size", String(fontSize));
      await refreshProfile();
      setAppearMsg({ ok: true, text: "Appearance saved!" });
    } catch {
      setAppearMsg({ ok: false, text: "Save failed. Please try again." });
    } finally {
      setAppearSaving(false);
      setTimeout(() => setAppearMsg(null), 3000);
    }
  }

  // ── Notifications ─────────────────────────────────────────────
  const [notifs, setNotifs] = useState({
    quests: true, streak: true, leaderboard: false, news: true,
  });
  const [notifMsg, setNotifMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function saveNotifications() {
    // In-browser only for now — no server-side push notifications implemented
    localStorage.setItem("notif_preferences", JSON.stringify(notifs));
    setNotifMsg({ ok: true, text: "Notification preferences saved!" });
    setTimeout(() => setNotifMsg(null), 3000);
  }

  // ── Privacy ───────────────────────────────────────────────────
  const [privacy, setPrivacy] = useState({
    publicProfile: true, showLeaderboard: true, activityVisible: false,
  });
  const [privacySaving, setPrivacySaving] = useState(false);
  const [privacyMsg, setPrivacyMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);

  async function savePrivacy() {
    if (!arenaUser?.uid) return;
    setPrivacySaving(true); setPrivacyMsg(null);
    try {
      await updateDoc(doc(db, "users", arenaUser.uid), { privacy });
      setPrivacyMsg({ ok: true, text: "Privacy settings saved!" });
    } catch {
      setPrivacyMsg({ ok: false, text: "Save failed. Please try again." });
    } finally {
      setPrivacySaving(false);
      setTimeout(() => setPrivacyMsg(null), 3000);
    }
  }

  async function handleResetProgress() {
    if (!arenaUser?.uid) return;
    setResetting(true);
    try {
      await updateDoc(doc(db, "users", arenaUser.uid), {
        xp: 0, coins: 100, rank: "Bronze", level: 1,
        solvedProblems: [], streak: 0, submissions: [], skills: {},
      });
      await refreshProfile();
      setConfirmReset(false);
      setPrivacyMsg({ ok: true, text: "Progress has been reset." });
    } catch {
      setPrivacyMsg({ ok: false, text: "Reset failed. Try again." });
    } finally {
      setResetting(false);
      setTimeout(() => setPrivacyMsg(null), 3000);
    }
  }

  // ── Security ──────────────────────────────────────────────────
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [secMsg, setSecMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function handlePasswordReset() {
    const email = firebaseUser?.email ?? arenaUser?.email;
    if (!email) return;
    setResetLoading(true); setSecMsg(null);
    try {
      await resetPassword(email);
      setResetSent(true);
      setSecMsg({ ok: true, text: `Password reset link sent to ${email}` });
    } catch {
      setSecMsg({ ok: false, text: "Failed to send reset email. Please try again." });
    } finally {
      setResetLoading(false);
      setTimeout(() => setSecMsg(null), 5000);
    }
  }

  async function handleSignOut() {
    await signOut();
    window.location.href = "/login";
  }

  const displayUser = arenaUser ?? user;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white mb-1">Settings</h1>
        <p className="text-gray-500 text-sm">Manage your account, appearance, and preferences</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="md:w-52 shrink-0">
          <div className="bg-[#16161f] border border-[#2a2a3a] rounded-xl overflow-hidden">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setSection(id)}
                className={clsx("w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium border-b border-[#2a2a3a] last:border-0 transition-colors",
                  section === id ? "bg-yellow-500/10 text-yellow-400 border-l-2 border-l-yellow-500" : "text-gray-400 hover:bg-[#1e1e2a] hover:text-white")}>
                <Icon size={15} /> {label}
              </button>
            ))}
            <button onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-red-400 hover:bg-red-900/20 transition-colors">
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">

            {/* ── ACCOUNT ── */}
            {section === "account" && (
              <motion.div key="account" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                className="bg-[#16161f] border border-[#2a2a3a] rounded-2xl p-6 space-y-6">
                <h2 className="font-bold text-white text-lg">Account Information</h2>

                {/* Current profile preview */}
                <div className="flex items-center gap-4 p-4 bg-[#0d0d14] rounded-xl border border-[#2a2a3a]">
                  <span className="text-5xl">{selectedAvatar}</span>
                  <div>
                    <p className="text-white font-bold">{username || displayUser.username}</p>
                    <p className="text-gray-500 text-sm">Level {displayUser.level} · {displayUser.rank}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{firebaseUser?.email ?? arenaUser?.email ?? "—"}</p>
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block font-medium uppercase tracking-wide">Username</label>
                  <input value={username} onChange={e => setUsername(e.target.value)} maxLength={20}
                    className="w-full bg-[#0d0d14] border border-[#2a2a3a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500/50 transition-colors" />
                  <p className="text-xs text-gray-600 mt-1">3–20 characters, letters, numbers and underscores only.</p>
                </div>

                {/* Email (read-only) */}
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block font-medium uppercase tracking-wide">Email</label>
                  <input readOnly value={firebaseUser?.email ?? arenaUser?.email ?? ""}
                    className="w-full bg-[#0d0d14] border border-[#1e1e2a] rounded-xl px-4 py-2.5 text-sm text-gray-500 cursor-not-allowed" />
                  <p className="text-xs text-gray-600 mt-1">Email cannot be changed. Contact support to update it.</p>
                </div>

                {/* Avatar picker */}
                <div>
                  <label className="text-xs text-gray-400 mb-3 block font-medium uppercase tracking-wide">Avatar</label>
                  <div className="grid grid-cols-8 sm:grid-cols-12 gap-2">
                    {AVATARS_LIST.map(a => (
                      <motion.button key={a} type="button" whileHover={{ scale: 1.18 }} whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedAvatar(a)}
                        className={clsx("text-xl p-2 rounded-xl border-2 transition-all", selectedAvatar === a
                          ? "border-yellow-500 bg-yellow-500/15 shadow-lg shadow-yellow-500/20"
                          : "border-[#2a2a3a] hover:border-[#3a3a4a] bg-[#0d0d14]")}>
                        {a}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <AnimatePresence>{accountMsg && <StatusMsg ok={accountMsg.ok} msg={accountMsg.text} />}</AnimatePresence>

                <motion.button whileTap={{ scale: 0.97 }} onClick={saveAccount} disabled={accountSaving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-yellow-500 to-orange-500 text-black disabled:opacity-60">
                  {accountSaving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Save size={14} /> Save Changes</>}
                </motion.button>
              </motion.div>
            )}

            {/* ── APPEARANCE ── */}
            {section === "appearance" && (
              <motion.div key="appearance" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                className="bg-[#16161f] border border-[#2a2a3a] rounded-2xl p-6 space-y-6">
                <h2 className="font-bold text-white text-lg">Appearance</h2>

                {/* Streak theme */}
                <div>
                  <label className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <Flame size={14} className="text-orange-400" /> Streak Theme
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(Object.entries(STREAK_THEMES) as [string, { icon: string; color: string; glow: string }][]).map(([key, t]) => (
                      <motion.button key={key} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={() => setStreakTheme(key)}
                        className={clsx("p-4 rounded-xl border transition-all", streakTheme === key
                          ? "border-yellow-500/60 bg-yellow-500/10 ring-1 ring-yellow-500/30"
                          : "border-[#2a2a3a] hover:border-[#3a3a4a]")}>
                        <div className={`h-8 rounded-lg bg-gradient-to-r ${t.color} mb-2 flex items-center justify-center text-lg`}>{t.icon}</div>
                        <p className="text-xs font-semibold text-white capitalize">{key}</p>
                        {streakTheme === key && <p className="text-xs text-yellow-400 mt-0.5">✓ Active</p>}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Editor font size */}
                <div>
                  <label className="text-sm font-semibold text-white mb-3 block">Code Editor Font Size</label>
                  <div className="flex gap-2 flex-wrap">
                    {FONT_SIZES.map(size => (
                      <motion.button key={size} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => setFontSize(size)}
                        className={clsx("px-4 py-2 rounded-lg border text-sm font-medium transition-colors", fontSize === size
                          ? "border-yellow-500/50 bg-yellow-500/10 text-yellow-400"
                          : "border-[#2a2a3a] text-gray-400 hover:border-[#3a3a4a] hover:text-white")}>
                        {size}px
                      </motion.button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 mt-2">This is applied to the code editor on problem pages.</p>
                </div>

                <AnimatePresence>{appearMsg && <StatusMsg ok={appearMsg.ok} msg={appearMsg.text} />}</AnimatePresence>

                <motion.button whileTap={{ scale: 0.97 }} onClick={saveAppearance} disabled={appearSaving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-yellow-500 to-orange-500 text-black disabled:opacity-60">
                  {appearSaving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Save size={14} /> Save Appearance</>}
                </motion.button>
              </motion.div>
            )}

            {/* ── NOTIFICATIONS ── */}
            {section === "notifications" && (
              <motion.div key="notifications" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                className="bg-[#16161f] border border-[#2a2a3a] rounded-2xl p-6 space-y-4">
                <div>
                  <h2 className="font-bold text-white text-lg">Notification Preferences</h2>
                  <p className="text-gray-500 text-xs mt-1">Choose what you want to be notified about.</p>
                </div>

                {([
                  { key: "quests" as const, label: "Quest Reminders", desc: "Daily and weekly quest reminders" },
                  { key: "streak" as const, label: "Streak Alerts", desc: "Get warned before losing your streak" },
                  { key: "leaderboard" as const, label: "Leaderboard Updates", desc: "Notify when your global rank changes" },
                  { key: "news" as const, label: "Platform News", desc: "New problems, contests, and features" },
                ]).map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-[#0d0d14] rounded-xl border border-[#2a2a3a]">
                    <div>
                      <p className="text-sm font-semibold text-white">{label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                    </div>
                    <Toggle on={notifs[key]} onToggle={() => setNotifs(p => ({ ...p, [key]: !p[key] }))} />
                  </div>
                ))}

                <AnimatePresence>{notifMsg && <StatusMsg ok={notifMsg.ok} msg={notifMsg.text} />}</AnimatePresence>

                <motion.button whileTap={{ scale: 0.97 }} onClick={saveNotifications}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-yellow-500 to-orange-500 text-black">
                  <Save size={14} /> Save Preferences
                </motion.button>
              </motion.div>
            )}

            {/* ── PRIVACY ── */}
            {section === "privacy" && (
              <motion.div key="privacy" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                className="bg-[#16161f] border border-[#2a2a3a] rounded-2xl p-6 space-y-4">
                <div>
                  <h2 className="font-bold text-white text-lg">Privacy & Visibility</h2>
                  <p className="text-gray-500 text-xs mt-1">Control what other users can see about you.</p>
                </div>

                {([
                  { key: "publicProfile" as const, label: "Public Profile", desc: "Allow other users to view your profile page" },
                  { key: "showLeaderboard" as const, label: "Show on Leaderboard", desc: "Display your username on the global leaderboard" },
                  { key: "activityVisible" as const, label: "Activity Heatmap", desc: "Show your submission heatmap publicly" },
                ]).map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-[#0d0d14] rounded-xl border border-[#2a2a3a]">
                    <div>
                      <p className="text-sm font-semibold text-white">{label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                    </div>
                    <Toggle on={privacy[key]} onToggle={() => setPrivacy(p => ({ ...p, [key]: !p[key] }))} />
                  </div>
                ))}

                <motion.button whileTap={{ scale: 0.97 }} onClick={savePrivacy} disabled={privacySaving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-yellow-500 to-orange-500 text-black disabled:opacity-60">
                  {privacySaving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Save size={14} /> Save Privacy Settings</>}
                </motion.button>

                <AnimatePresence>{privacyMsg && <StatusMsg ok={privacyMsg.ok} msg={privacyMsg.text} />}</AnimatePresence>

                {/* Danger zone */}
                <div className="pt-4 border-t border-[#2a2a3a] space-y-3">
                  <h3 className="text-sm font-bold text-red-400 flex items-center gap-2"><Trash2 size={14} /> Danger Zone</h3>
                  <p className="text-xs text-gray-500">This will permanently reset all your XP, coins, rank, and submission history. This cannot be undone.</p>

                  {!confirmReset ? (
                    <button onClick={() => setConfirmReset(true)}
                      className="px-4 py-2 border border-red-500/30 text-red-400 rounded-xl text-sm hover:bg-red-900/20 transition-colors">
                      Reset All Progress
                    </button>
                  ) : (
                    <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 space-y-3">
                      <p className="text-red-300 text-sm font-semibold">⚠️ Are you absolutely sure? This cannot be undone!</p>
                      <div className="flex gap-3">
                        <button onClick={() => setConfirmReset(false)}
                          className="px-4 py-2 bg-[#2a2a3a] text-gray-300 rounded-lg text-sm hover:bg-[#3a3a4a] transition-colors">
                          Cancel
                        </button>
                        <button onClick={handleResetProgress} disabled={resetting}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 disabled:opacity-60">
                          {resetting ? <><Loader2 size={13} className="animate-spin" /> Resetting…</> : "Yes, Reset Everything"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── SECURITY ── */}
            {section === "security" && (
              <motion.div key="security" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                className="bg-[#16161f] border border-[#2a2a3a] rounded-2xl p-6 space-y-6">
                <h2 className="font-bold text-white text-lg">Security</h2>

                {/* Password Reset */}
                <div className="p-5 bg-[#0d0d14] border border-[#2a2a3a] rounded-xl space-y-3">
                  <div className="flex items-start gap-3">
                    <Key size={18} className="text-yellow-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-white">Change Password</p>
                      <p className="text-xs text-gray-500 mt-0.5">We will send a password reset link to your registered email address.</p>
                      <p className="text-xs text-yellow-400/80 mt-1 font-mono">{firebaseUser?.email ?? arenaUser?.email}</p>
                    </div>
                  </div>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={handlePasswordReset} disabled={resetLoading || resetSent}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-sm font-bold rounded-xl disabled:opacity-60">
                    {resetLoading ? <><Loader2 size={14} className="animate-spin" /> Sending…</>
                      : resetSent ? <><CheckCircle2 size={14} /> Email Sent!</>
                        : "Send Password Reset Email"}
                  </motion.button>
                  <AnimatePresence>{secMsg && <StatusMsg ok={secMsg.ok} msg={secMsg.text} />}</AnimatePresence>
                </div>

                {/* Verified status */}
                <div className="p-5 bg-[#0d0d14] border border-[#2a2a3a] rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">Email Verification</p>
                      <p className="text-xs text-gray-500 mt-0.5">Verified accounts have full access to CodeArena features.</p>
                    </div>
                    <div className={clsx("flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border",
                      firebaseUser?.emailVerified
                        ? "text-green-400 bg-green-900/20 border-green-500/30"
                        : "text-red-400 bg-red-900/20 border-red-500/30")}>
                      {firebaseUser?.emailVerified
                        ? <><CheckCircle2 size={12} /> Verified</>
                        : <><AlertCircle size={12} /> Not Verified</>}
                    </div>
                  </div>
                </div>

                {/* Sign out everywhere */}
                <div className="pt-2 border-t border-[#2a2a3a]">
                  <button onClick={handleSignOut}
                    className="flex items-center gap-2 px-5 py-2.5 border border-red-500/30 text-red-400 rounded-xl text-sm font-semibold hover:bg-red-900/20 transition-colors">
                    <LogOut size={14} /> Sign Out of CodeArena
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
