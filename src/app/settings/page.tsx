"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useGame } from "@/store/GameContext";
import { STREAK_THEMES } from "@/lib/data";
import { User, Bell, Shield, Palette, Save, Flame } from "lucide-react";
import clsx from "clsx";

type Section = "account" | "appearance" | "notifications" | "privacy";

const SECTIONS: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: "account", label: "Account", icon: User },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy", icon: Shield },
];

export default function SettingsPage() {
  const { user } = useGame();
  const [section, setSection] = useState<Section>("account");
  const [saved, setSaved] = useState(false);
  const [notifs, setNotifs] = useState({ quests: true, streak: true, leaderboard: false, news: true });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white mb-1">Settings</h1>
        <p className="text-gray-500 text-sm">Manage your account and preferences</p>
      </div>

      <div className="flex flex-col md:flex-row gap-5">
        {/* Sidebar */}
        <div className="md:w-48 shrink-0">
          <div className="bg-[#16161f] border border-[#2a2a3a] rounded-xl overflow-hidden">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setSection(id)}
                className={clsx("w-full flex items-center gap-3 px-4 py-3 text-sm font-medium border-b border-[#2a2a3a] last:border-0 transition-colors",
                  section === id ? "bg-yellow-500/10 text-yellow-400" : "text-gray-400 hover:bg-[#1e1e2a] hover:text-white")}>
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {section === "account" && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
              className="bg-[#16161f] border border-[#2a2a3a] rounded-2xl p-6 space-y-5">
              <h2 className="font-bold text-white">Account Information</h2>
              <div className="flex items-center gap-4 p-4 bg-[#0d0d14] rounded-xl border border-[#2a2a3a]">
                <span className="text-5xl">{user.avatar}</span>
                <div>
                  <p className="text-white font-bold">{user.username}</p>
                  <p className="text-gray-500 text-sm">Level {user.level} · {user.rank}</p>
                  <p className="text-xs text-gray-600 mt-1">Member since {new Date(user.joinedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block font-medium uppercase tracking-wide">Username</label>
                  <input defaultValue={user.username}
                    className="w-full bg-[#0d0d14] border border-[#2a2a3a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500/50 transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block font-medium uppercase tracking-wide">Email</label>
                  <input defaultValue="dragoncoder@arena.dev"
                    className="w-full bg-[#0d0d14] border border-[#2a2a3a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500/50 transition-colors" />
                </div>
              </div>
              <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave}
                className={clsx("flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                  saved ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-gradient-to-r from-yellow-500 to-orange-500 text-black")}>
                <Save size={14} /> {saved ? "Saved!" : "Save Changes"}
              </motion.button>
            </motion.div>
          )}

          {section === "appearance" && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
              className="bg-[#16161f] border border-[#2a2a3a] rounded-2xl p-6 space-y-6">
              <h2 className="font-bold text-white">Appearance</h2>
              <div>
                <label className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Flame size={14} className="text-orange-400" /> Streak Theme
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(Object.entries(STREAK_THEMES) as [string, { icon: string; color: string; glow: string }][]).map(([key, t]) => (
                    <button key={key}
                      className={clsx("p-4 rounded-xl border transition-all",
                        user.streakTheme === key ? "border-yellow-500/50 bg-yellow-500/10" : "border-[#2a2a3a] hover:border-[#3a3a4a]")}>
                      <div className={`h-8 rounded-lg bg-gradient-to-r ${t.color} mb-2 flex items-center justify-center text-lg`}>{t.icon}</div>
                      <p className="text-xs font-semibold text-white capitalize">{key}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-white mb-3 block">Editor Font Size</label>
                <div className="flex gap-2 flex-wrap">
                  {[12, 13, 14, 15, 16].map(size => (
                    <button key={size}
                      className={clsx("px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors",
                        size === 14 ? "border-yellow-500/50 bg-yellow-500/10 text-yellow-400" : "border-[#2a2a3a] text-gray-400 hover:border-[#3a3a4a]")}>
                      {size}px
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {section === "notifications" && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
              className="bg-[#16161f] border border-[#2a2a3a] rounded-2xl p-6 space-y-3">
              <h2 className="font-bold text-white mb-4">Notification Preferences</h2>
              {([
                { key: "quests" as const, label: "Quest Reminders", desc: "Daily and weekly quest alerts" },
                { key: "streak" as const, label: "Streak Alerts", desc: "Remind me to maintain my streak" },
                { key: "leaderboard" as const, label: "Leaderboard Updates", desc: "Notify when my rank changes" },
                { key: "news" as const, label: "Platform News", desc: "New problems, contests, and features" },
              ]).map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between p-4 bg-[#0d0d14] rounded-xl border border-[#2a2a3a]">
                  <div>
                    <p className="text-sm font-semibold text-white">{label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                  </div>
                  <button onClick={() => setNotifs(p => ({ ...p, [key]: !p[key] }))}
                    className={clsx("relative w-11 h-6 rounded-full transition-colors", notifs[key] ? "bg-yellow-500" : "bg-[#2a2a3a]")}>
                    <span className={clsx("absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform", notifs[key] ? "translate-x-5" : "translate-x-0.5")} />
                  </button>
                </div>
              ))}
            </motion.div>
          )}

          {section === "privacy" && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
              className="bg-[#16161f] border border-[#2a2a3a] rounded-2xl p-6 space-y-3">
              <h2 className="font-bold text-white mb-4">Privacy & Security</h2>
              {[
                { label: "Public Profile", desc: "Allow others to view your profile", enabled: true },
                { label: "Show on Leaderboard", desc: "Display your username publicly", enabled: true },
                { label: "Activity Visibility", desc: "Show your submission heatmap publicly", enabled: false },
              ].map(({ label, desc, enabled }) => (
                <div key={label} className="flex items-center justify-between p-4 bg-[#0d0d14] rounded-xl border border-[#2a2a3a]">
                  <div>
                    <p className="text-sm font-semibold text-white">{label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                  </div>
                  <button className={clsx("relative w-11 h-6 rounded-full transition-colors", enabled ? "bg-yellow-500" : "bg-[#2a2a3a]")}>
                    <span className={clsx("absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform", enabled ? "translate-x-5" : "translate-x-0.5")} />
                  </button>
                </div>
              ))}
              <div className="pt-4 border-t border-[#2a2a3a]">
                <h3 className="text-sm font-bold text-red-400 mb-3">Danger Zone</h3>
                <button className="px-4 py-2 border border-red-500/30 text-red-400 rounded-xl text-sm hover:bg-red-900/20 transition-colors">
                  Reset Progress
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
