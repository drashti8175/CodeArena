"use client";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { useGame } from "@/store/GameContext";
import { MOCK_QUESTS, RANK_COLORS, RANK_BG, STREAK_THEMES, generateHeatmap } from "@/lib/data";
import XPBar from "@/components/ui/XPBar";
import StreakBadge from "@/components/ui/StreakBadge";
import QuestCard from "@/components/dashboard/QuestCard";
import SkillTree from "@/components/dashboard/SkillTree";
import DifficultyBadge from "@/components/ui/DifficultyBadge";
import EmailVerificationGate from "@/components/auth/EmailVerificationGate";
import { Zap, CheckCircle2, TrendingUp, Target, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

const heatmap = generateHeatmap();

function Heatmap() {
  const weeks: typeof heatmap[] = [];
  for (let i = 0; i < heatmap.length; i += 7) weeks.push(heatmap.slice(i, i + 7));
  const getColor = (count: number) => {
    if (count === 0) return "bg-[#1e1e2a]";
    if (count === 1) return "bg-yellow-900/60";
    if (count === 2) return "bg-yellow-700/70";
    if (count === 3) return "bg-yellow-600/80";
    return "bg-yellow-500";
  };
  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1 min-w-max">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day, di) => (
              <div key={di} title={`${day.date}: ${day.count} submissions`}
                className={clsx("heatmap-cell cursor-pointer hover:ring-1 hover:ring-yellow-400/50 transition-all", getColor(day.count))} />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
        <span>Less</span>
        {["bg-[#1e1e2a]", "bg-yellow-900/60", "bg-yellow-700/70", "bg-yellow-600/80", "bg-yellow-500"].map((c, i) => (
          <div key={i} className={clsx("heatmap-cell", c)} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, problems } = useGame();
  const solved = problems.filter(p => user.solvedProblems.includes(p.id));
  const easy = solved.filter(p => p.difficulty === "Easy").length;
  const medium = solved.filter(p => p.difficulty === "Medium").length;
  const hard = solved.filter(p => p.difficulty === "Hard").length;
  const totalEasy = problems.filter(p => p.difficulty === "Easy").length;
  const totalMedium = problems.filter(p => p.difficulty === "Medium").length;
  const totalHard = problems.filter(p => p.difficulty === "Hard").length;
  const recentSubs = (user.submissions ?? []).slice(0, 5);
  const dailyQuests = MOCK_QUESTS.filter(q => q.type === "daily");
  const weeklyQuests = MOCK_QUESTS.filter(q => q.type === "weekly");
  const unsolved = problems.filter(p => !user.solvedProblems.includes(p.id));

  const statusColor = (s: string) => {
    if (s === "Accepted") return "text-green-400";
    if (s === "Wrong Answer") return "text-red-400";
    return "text-yellow-400";
  };

  return (
    <>
      <EmailVerificationGate />
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Hero card */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${RANK_BG[user.rank]} border border-[#2a2a3a] p-6`}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(245,158,11,0.08),transparent)]" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <motion.div animate={{ scale: [1, 1.04, 1] }} transition={{ repeat: Infinity, duration: 3 }} className="text-6xl shrink-0">
            {user.avatar}
          </motion.div>
          <div className="flex-1 w-full min-w-0">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="text-2xl font-black text-white">{user.username}</h1>
              <span className={`font-bold text-sm ${RANK_COLORS[user.rank]}`}>{user.rank} ✦</span>
            </div>
            <XPBar xp={user.xp} level={user.level} />
          </div>
          <StreakBadge streak={user.streak} theme={user.streakTheme} />
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: <Zap size={18} className="text-yellow-400" />, label: "Total XP", value: user.xp.toLocaleString(), color: "text-yellow-400" },
          { icon: <CheckCircle2 size={18} className="text-green-400" />, label: "Solved", value: `${solved.length}/${problems.length}`, color: "text-green-400" },
          { icon: <span className="text-lg">🪙</span>, label: "Coins", value: user.coins.toLocaleString(), color: "text-amber-400" },
          { icon: <TrendingUp size={18} className="text-purple-400" />, label: "Level", value: user.level, color: "text-purple-400" },
        ].map(({ icon, label, value, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="bg-[#16161f] border border-[#2a2a3a] rounded-xl p-4 flex items-center gap-3 hover:border-[#3a3a4a] transition-colors">
            {icon}
            <div>
              <p className="text-gray-500 text-xs">{label}</p>
              <p className={`font-black text-xl ${color}`}>{value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Solved breakdown */}
          <div className="bg-[#16161f] border border-[#2a2a3a] rounded-xl p-5">
            <h2 className="font-bold text-white mb-4 flex items-center gap-2"><CheckCircle2 size={16} className="text-green-400" /> Progress</h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Easy", solved: easy, total: totalEasy, color: "text-green-400", bar: "from-green-600 to-green-400" },
                { label: "Medium", solved: medium, total: totalMedium, color: "text-yellow-400", bar: "from-yellow-600 to-yellow-400" },
                { label: "Hard", solved: hard, total: totalHard, color: "text-red-400", bar: "from-red-600 to-red-400" },
              ].map(({ label, solved: s, total, color, bar }) => (
                <div key={label} className="text-center">
                  <div className={`text-3xl font-black ${color}`}>{s}</div>
                  <div className="text-gray-500 text-xs mb-2">/ {total} {label}</div>
                  <div className="h-1.5 bg-[#2a2a3a] rounded-full overflow-hidden">
                    <motion.div className={`h-full bg-gradient-to-r ${bar} rounded-full`}
                      initial={{ width: 0 }} animate={{ width: `${total ? (s / total) * 100 : 0}%` }} transition={{ duration: 0.8 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity heatmap */}
          <div className="bg-[#16161f] border border-[#2a2a3a] rounded-xl p-5">
            <h2 className="font-bold text-white mb-4 flex items-center gap-2"><Clock size={16} className="text-blue-400" /> Activity</h2>
            <Heatmap />
          </div>

          {/* Recent submissions */}
          <div className="bg-[#16161f] border border-[#2a2a3a] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-white flex items-center gap-2"><Clock size={16} className="text-purple-400" /> Recent Submissions</h2>
              <Link href="/submissions" className="text-xs text-yellow-400 hover:underline flex items-center gap-1">View all <ArrowRight size={12} /></Link>
            </div>
            {recentSubs.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No submissions yet. <Link href="/problems" className="text-yellow-400 hover:underline">Start solving!</Link></p>
            ) : (
              <div className="space-y-2">
                {recentSubs.map(s => (
                  <div key={s.id} className="flex items-center gap-3 py-2.5 px-3 bg-[#0d0d14] rounded-lg border border-[#1e1e2a] text-sm">
                    <span className={`font-semibold text-xs w-28 shrink-0 ${statusColor(s.status)}`}>{s.status}</span>
                    <Link href={`/problems/${s.problemId}`} className="text-gray-300 hover:text-yellow-400 transition-colors flex-1 truncate">{s.problemTitle}</Link>
                    <span className="text-gray-600 text-xs shrink-0">{s.language}</span>
                    {s.runtime !== "—" && <span className="text-gray-500 text-xs shrink-0">{s.runtime}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quests */}
          <div>
            <h2 className="font-bold text-white mb-3 flex items-center gap-2"><Target size={16} className="text-blue-400" /> Daily Quests</h2>
            <div className="space-y-2">{dailyQuests.map(q => <QuestCard key={q.id} quest={q} />)}</div>
          </div>
          <div>
            <h2 className="font-bold text-white mb-3 flex items-center gap-2"><span>🗓️</span> Weekly Missions</h2>
            <div className="space-y-2">{weeklyQuests.map(q => <QuestCard key={q.id} quest={q} />)}</div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Skill tree */}
          <div className="bg-[#16161f] border border-[#2a2a3a] rounded-xl p-5">
            <h2 className="font-bold text-white mb-4">🌳 Skill Tree</h2>
            <SkillTree skills={user.skills} />
          </div>

          {/* Recommended problems */}
          <div className="bg-[#16161f] border border-[#2a2a3a] rounded-xl p-5">
            <h2 className="font-bold text-white mb-3 flex items-center gap-2"><Zap size={15} className="text-yellow-400" /> Recommended</h2>
            <div className="space-y-2">
              {unsolved.slice(0, 4).map(p => (
                <Link key={p.id} href={`/problems/${p.id}`}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#1e1e2a] transition-colors group">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300 group-hover:text-yellow-400 transition-colors truncate">{p.title}</p>
                  </div>
                  <DifficultyBadge difficulty={p.difficulty} />
                </Link>
              ))}
            </div>
            <Link href="/problems" className="mt-3 flex items-center justify-center gap-1 text-xs text-yellow-400 hover:underline pt-3 border-t border-[#2a2a3a]">
              View all problems <ArrowRight size={12} />
            </Link>
          </div>

          {/* Boss battle */}
          <motion.div whileHover={{ scale: 1.01 }}
            className="p-4 rounded-xl bg-gradient-to-br from-red-900/30 to-orange-900/20 border border-red-700/30 cursor-pointer">
            <div className="flex items-center gap-3">
              <motion.span animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="text-3xl">🐲</motion.span>
              <div className="flex-1">
                <p className="font-bold text-red-400 text-sm">Boss Battle</p>
                <p className="text-xs text-gray-400 mb-1.5">Dragon of Arrays — 2400 HP</p>
                <div className="h-1.5 bg-[#2a2a3a] rounded-full overflow-hidden">
                  <div className="h-full w-3/5 bg-gradient-to-r from-red-500 to-orange-500 rounded-full" />
                </div>
              </div>
              <span className="text-xs text-gray-500 bg-[#1e1e2a] px-2 py-1 rounded-full border border-[#2a2a3a]">Soon</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
    </>
  );
}
