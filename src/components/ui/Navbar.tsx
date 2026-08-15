"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useGame } from "@/store/GameContext";
import { useAuth } from "@/store/AuthContext";
import { RANK_COLORS } from "@/lib/data";
import clsx from "clsx";
import { useState } from "react";
import { LayoutDashboard, Code2, Trophy, User, Menu, X, Zap, ClipboardList, Settings, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/problems", label: "Problems", icon: Code2 },
  { href: "/submissions", label: "Submissions", icon: ClipboardList },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Navbar() {
  const path = usePathname();
  const router = useRouter();
  const { user } = useGame();
  const { arenaUser, firebaseUser, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  // Use real Firebase user if available, fall back to mock
  const displayUser = arenaUser ?? user;
  const isLoggedIn = !!firebaseUser;

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  // Don't show navbar on auth pages
  if (path === "/login" || path === "/signup") return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0d0d14]/90 backdrop-blur-md border-b border-[#2a2a3a]">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-xl">⚔️</span>
          <span className="font-black text-lg bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            CodeArena
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                path.startsWith(href)
                  ? "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}>
              <Icon size={15} />{label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <div className="flex items-center gap-1.5 text-sm">
                <Zap size={14} className="text-yellow-400" />
                <span className="text-yellow-400 font-bold">{displayUser.xp.toLocaleString()} XP</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                <span>🪙</span>
                <span className="text-amber-400 font-bold">{displayUser.coins}</span>
              </div>
              <Link href="/profile" className="flex items-center gap-2 bg-[#1e1e2a] border border-[#2a2a3a] px-3 py-1.5 rounded-lg hover:border-[#3a3a4a] transition-colors">
                <span className="text-lg leading-none">{displayUser.avatar}</span>
                <div className="text-left">
                  <div className="text-xs font-bold text-white leading-none">{displayUser.username}</div>
                  <div className={`text-xs font-bold leading-none mt-0.5 ${RANK_COLORS[displayUser.rank]}`}>{displayUser.rank}</div>
                </div>
              </Link>
              <button onClick={handleSignOut}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-400 hover:text-red-400 hover:bg-red-900/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20">
                <LogOut size={14} />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login"
                className="px-4 py-1.5 text-sm font-medium text-gray-300 hover:text-white border border-[#2a2a3a] rounded-lg hover:border-[#3a3a4a] transition-colors">
                Sign In
              </Link>
              <Link href="/signup"
                className="px-4 py-1.5 text-sm font-bold bg-gradient-to-r from-yellow-500 to-orange-500 text-black rounded-lg hover:shadow-lg hover:shadow-orange-500/20 transition-all">
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(o => !o)} className="md:hidden p-2 text-gray-400 hover:text-white">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-[#2a2a3a] bg-[#0d0d14]">
            <div className="px-4 py-3 space-y-1">
              {NAV.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} onClick={() => setOpen(false)}
                  className={clsx("flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    path.startsWith(href) ? "bg-yellow-500/15 text-yellow-400" : "text-gray-400 hover:text-white hover:bg-white/5")}>
                  <Icon size={16} />{label}
                </Link>
              ))}
              <div className="flex items-center justify-between px-3 py-2 border-t border-[#2a2a3a] mt-2 pt-3">
                {isLoggedIn ? (
                  <>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-yellow-400 font-bold">{displayUser.xp.toLocaleString()} XP</span>
                      <span className="text-amber-400 font-bold">🪙 {displayUser.coins}</span>
                    </div>
                    <button onClick={handleSignOut} className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300">
                      <LogOut size={14} /> Sign Out
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2 w-full">
                    <Link href="/login" onClick={() => setOpen(false)} className="flex-1 text-center py-2 text-sm border border-[#2a2a3a] rounded-lg text-gray-300">Sign In</Link>
                    <Link href="/signup" onClick={() => setOpen(false)} className="flex-1 text-center py-2 text-sm bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-lg">Sign Up</Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
