"use client";
import { motion } from "framer-motion";
import Link from "next/link";

const FEATURES = [
  { icon: "⚔️", title: "Problem Arena", desc: "LeetCode-style problems with XP rewards, hints, and real-time judging" },
  { icon: "🏆", title: "Rank System", desc: "Climb from Bronze to Legend through 5 tiers as you solve more problems" },
  { icon: "🔥", title: "Streaks", desc: "Fire, Ice, and Galaxy streak themes that evolve with your consistency" },
  { icon: "🌳", title: "Skill Tree", desc: "Level up 8 skill branches: DP, Graphs, Trees, Greedy, and more" },
  { icon: "📊", title: "Dashboard", desc: "Activity heatmap, submission history, and progress tracking" },
  { icon: "🐲", title: "Boss Battles", desc: "Defeat bosses by solving problems — each solution deals damage" },
];

const STATS = [
  { value: "12+", label: "Problems" },
  { value: "5", label: "Rank Tiers" },
  { value: "8", label: "Skill Branches" },
  { value: "3", label: "Streak Themes" },
];

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(245,158,11,0.1),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_80%,rgba(168,85,247,0.06),transparent)]" />

      {/* Hero */}
      <div className="relative max-w-5xl mx-auto px-4 pt-20 pb-16 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <motion.div animate={{ rotate: [0, 8, -8, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="text-7xl mb-6 inline-block">
            ⚔️
          </motion.div>
          <h1 className="text-6xl sm:text-7xl font-black mb-4 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 bg-clip-text text-transparent leading-tight">
            CodeArena
          </h1>
          <p className="text-xl text-gray-400 mb-2 font-medium">Competitive Programming Meets Gaming</p>
          <p className="text-gray-600 mb-10 max-w-xl mx-auto">Solve problems. Earn XP. Level up your hero. Defeat bosses. Become Legend.</p>

          <div className="flex gap-4 justify-center flex-wrap mb-16">
            <Link href="/dashboard">
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                className="px-8 py-3.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black rounded-xl text-lg shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-shadow">
                Enter Arena 🏟️
              </motion.button>
            </Link>
            <Link href="/problems">
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                className="px-8 py-3.5 bg-[#16161f] border border-[#2a2a3a] text-white font-bold rounded-xl text-lg hover:border-[#3a3a4a] transition-colors">
                Browse Problems
              </motion.button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 max-w-lg mx-auto mb-20">
            {STATS.map(({ value, label }, i) => (
              <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                className="bg-[#16161f] border border-[#2a2a3a] rounded-xl p-3 text-center">
                <div className="text-2xl font-black text-yellow-400">{value}</div>
                <div className="text-xs text-gray-500">{label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Features */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h2 className="text-2xl font-black text-white mb-8">Everything you need to level up</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
            {FEATURES.map(({ icon, title, desc }, i) => (
              <motion.div key={title} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.08 }}
                whileHover={{ y: -3, borderColor: "rgba(245,158,11,0.3)" }}
                className="bg-[#16161f] border border-[#2a2a3a] rounded-xl p-5 transition-all cursor-default">
                <div className="text-3xl mb-3">{icon}</div>
                <h3 className="font-bold text-white mb-1">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          className="mt-16 p-8 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/20 rounded-2xl">
          <h2 className="text-2xl font-black text-white mb-2">Ready to become Legend?</h2>
          <p className="text-gray-400 mb-6">Join the arena and start your journey from Bronze to Legend.</p>
          <Link href="/dashboard">
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black rounded-xl shadow-lg shadow-orange-500/20">
              Start Your Journey ⚡
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
