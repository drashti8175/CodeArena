"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { MOCK_LEADERBOARD, RANK_COLORS } from "@/lib/data";
import { useGame } from "@/store/GameContext";
import { Search, Flame, Trophy, TrendingUp } from "lucide-react";
import clsx from "clsx";

const MEDAL = ["🥇", "🥈", "🥉"];
const TABS = ["Global", "This Week", "All Time"] as const;

export default function LeaderboardPage() {
  const { user } = useGame();
  const [tab, setTab] = useState<typeof TABS[number]>("Global");
  const [search, setSearch] = useState("");

  const filtered = MOCK_LEADERBOARD.filter(e =>
    e.user.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-white mb-1 flex items-center gap-3"><Trophy className="text-yellow-400" /> Leaderboard</h1>
        <p className="text-gray-500">Compete with the best coders in the arena</p>
      </div>

      {/* Podium */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[MOCK_LEADERBOARD[1], MOCK_LEADERBOARD[0], MOCK_LEADERBOARD[2]].map((entry, i) => {
          const actualRank = i === 0 ? 2 : i === 1 ? 1 : 3;
          const isYou = entry.user.id === user.id;
          return (
            <motion.div key={entry.user.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: i === 1 ? -8 : 0 }} transition={{ delay: i * 0.1 }}
              className={clsx("text-center p-4 rounded-xl border transition-all",
                actualRank === 1 ? "border-yellow-500/40 bg-gradient-to-b from-yellow-900/20 to-transparent" :
                actualRank === 2 ? "border-slate-500/30 bg-[#16161f]" : "border-amber-700/30 bg-[#16161f]",
                isYou && "ring-2 ring-yellow-400/30"
              )}>
              <div className="text-3xl mb-1">{MEDAL[actualRank - 1]}</div>
              <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 3, delay: i * 0.5 }} className="text-4xl mb-2">
                {entry.user.avatar}
              </motion.div>
              <div className="font-bold text-white text-sm">{entry.user.username}</div>
              <div className={`text-xs font-bold ${RANK_COLORS[entry.user.rank]}`}>{entry.user.rank}</div>
              <div className="text-yellow-400 font-black mt-1">{entry.user.xp.toLocaleString()} XP</div>
              <div className="text-gray-500 text-xs">{entry.solvedCount} solved</div>
            </motion.div>
          );
        })}
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex bg-[#16161f] border border-[#2a2a3a] rounded-xl p-1 gap-1">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={clsx("px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                tab === t ? "bg-yellow-500/15 text-yellow-400" : "text-gray-500 hover:text-gray-300")}>
              {t}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search players..."
            className="w-full bg-[#16161f] border border-[#2a2a3a] rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500/40" />
        </div>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-[48px_1fr_80px_80px_80px_80px] gap-3 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-[#2a2a3a]">
        <div>Rank</div><div>Player</div><div className="text-right">XP</div>
        <div className="text-right">Solved</div><div className="text-right hidden sm:block">Streak</div><div className="text-right hidden sm:block">Acc%</div>
      </div>

      {/* Rows */}
      <div className="space-y-1 mt-1">
        {filtered.map((entry, i) => {
          const isYou = entry.user.id === user.id;
          return (
            <motion.div key={entry.user.id}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              className={clsx(
                "grid grid-cols-[48px_1fr_80px_80px_80px_80px] gap-3 px-4 py-3 rounded-xl border items-center transition-colors",
                isYou ? "border-yellow-500/30 bg-yellow-900/10" : "border-[#1e1e2a] bg-[#16161f] hover:border-[#2a2a3a] hover:bg-[#1e1e2a]"
              )}>
              <div className="text-center font-black text-lg">
                {i < 3 ? MEDAL[i] : <span className="text-gray-500 text-sm">#{entry.rank}</span>}
              </div>
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl shrink-0">{entry.user.avatar}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm truncate">{entry.user.username}</span>
                    {isYou && <span className="text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-1.5 py-0.5 rounded-full shrink-0">You</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${RANK_COLORS[entry.user.rank]}`}>{entry.user.rank}</span>
                    <span className="text-xs text-gray-500">Lv.{entry.user.level}</span>
                  </div>
                </div>
              </div>
              <div className="text-right text-yellow-400 font-bold text-sm">{entry.user.xp.toLocaleString()}</div>
              <div className="text-right text-white font-semibold text-sm">{entry.solvedCount}</div>
              <div className="text-right hidden sm:flex items-center justify-end gap-1 text-orange-400 text-sm">
                <Flame size={12} />{entry.streak ?? 0}
              </div>
              <div className="text-right hidden sm:block text-gray-400 text-sm">{entry.acceptanceRate ?? 0}%</div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
