"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useGame } from "@/store/GameContext";
import { RANK_COLORS, RANK_BG, generateHeatmap } from "@/lib/data";
import XPBar from "@/components/ui/XPBar";
import SkillTree from "@/components/dashboard/SkillTree";
import StreakBadge from "@/components/ui/StreakBadge";
import DifficultyBadge from "@/components/ui/DifficultyBadge";
import LoginHistory from "@/components/profile/LoginHistory";
import { Share2, CheckCircle2, XCircle, AlertCircle, Zap, Calendar, Check, Copy } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

const heatmap = generateHeatmap();

function MiniHeatmap() {
  const last12Weeks = heatmap.slice(-84);
  const weeks: typeof heatmap[] = [];
  for (let i = 0; i < last12Weeks.length; i += 7) weeks.push(last12Weeks.slice(i, i + 7));
  const getColor = (count: number) => {
    if (count === 0) return "bg-[#1e1e2a]";
    if (count === 1) return "bg-yellow-900/60";
    if (count === 2) return "bg-yellow-700/70";
    if (count === 3) return "bg-yellow-600/80";
    return "bg-yellow-500";
  };
  return (
    <div className="flex gap-1">
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-1">
          {week.map((day, di) => (
            <div key={di} title={`${day.date}: ${day.count}`} className={clsx("heatmap-cell", getColor(day.count))} />
          ))}
        </div>
      ))}
    </div>
  );
}

const statusIcon = (s: string) => {
  if (s === "Accepted") return <CheckCircle2 size={14} className="text-green-400 shrink-0" />;
  if (s === "Wrong Answer") return <XCircle size={14} className="text-red-400 shrink-0" />;
  return <AlertCircle size={14} className="text-yellow-400 shrink-0" />;
};
const statusColor = (s: string) => s === "Accepted" ? "text-green-400" : s === "Wrong Answer" ? "text-red-400" : "text-yellow-400";

export default function ProfilePage() {
  const { user, problems } = useGame();
  const [copied, setCopied] = useState(false);
  const solved = problems.filter(p => user.solvedProblems.includes(p.id));
  const easy = solved.filter(p => p.difficulty === "Easy").length;
  const medium = solved.filter(p => p.difficulty === "Medium").length;
  const hard = solved.filter(p => p.difficulty === "Hard").length;
  const totalEasy = problems.filter(p => p.difficulty === "Easy").length;
  const totalMedium = problems.filter(p => p.difficulty === "Medium").length;
  const totalHard = problems.filter(p => p.difficulty === "Hard").length;
  const allSubs = user.submissions ?? [];
  const accepted = allSubs.filter(s => s.status === "Accepted").length;
  const accRate = allSubs.length ? Math.round((accepted / allSubs.length) * 100) : 0;

  const handleShare = async () => {
    const text = `Check out my CodeArena profile! I'm a ${user.rank} rank with ${solved.length} problems solved. 🚀`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'CodeArena Profile',
          text,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Error sharing", err);
      }
    } else {
      await navigator.clipboard.writeText(`${text}\n${window.location.href}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
      {/* Profile card */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${RANK_BG[user.rank]} border border-[#2a2a3a] p-6`}>
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-yellow-500/8 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row gap-5 items-start">
          <div className="flex flex-col items-center gap-3">
            <motion.div animate={{ scale: [1, 1.04, 1] }} transition={{ repeat: Infinity, duration: 3 }} className="text-7xl">
              {user.avatar}
            </motion.div>
            <StreakBadge streak={user.streak} theme={user.streakTheme} />
          </div>
          <div className="flex-1 w-full">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="text-3xl font-black text-white">{user.username}</h1>
              <span className={`text-base font-black ${RANK_COLORS[user.rank]}`}>{user.rank} ✦</span>
            </div>
            <p className="text-gray-500 text-sm mb-4 flex items-center gap-1.5">
              <Calendar size={13} /> Member since {new Date(user.joinedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
            <XPBar xp={user.xp} level={user.level} />
            <div className="grid grid-cols-4 gap-3 mt-4">
              {[
                { label: "Solved", value: solved.length, color: "text-green-400" },
                { label: "Coins", value: `🪙 ${user.coins}`, color: "text-amber-400" },
                { label: "Level", value: user.level, color: "text-white" },
                { label: "Acc. Rate", value: `${accRate}%`, color: "text-blue-400" },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-black/20 rounded-lg p-3 text-center">
                  <div className={`text-xl font-black ${color}`}>{value}</div>
                  <div className="text-xs text-gray-500">{label}</div>
                </div>
              ))}
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-white/8 border border-white/15 rounded-lg text-white text-sm font-medium hover:bg-white/15 transition-colors shrink-0">
            {copied ? <Check size={14} className="text-green-400" /> : <Share2 size={14} />} {copied ? "Copied!" : "Share"}
          </motion.button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Solved breakdown */}
        <div className="bg-[#16161f] border border-[#2a2a3a] rounded-xl p-5">
          <h2 className="font-bold text-white mb-4 flex items-center gap-2"><CheckCircle2 size={15} className="text-green-400" /> Problems Solved</h2>
          <div className="space-y-3">
            {([
              ["Easy", easy, totalEasy, "bg-green-500", "text-green-400"],
              ["Medium", medium, totalMedium, "bg-yellow-500", "text-yellow-400"],
              ["Hard", hard, totalHard, "bg-red-500", "text-red-400"],
            ] as const).map(([d, count, total, bar, color]) => (
              <div key={d} className="flex items-center gap-3">
                <DifficultyBadge difficulty={d} />
                <div className="flex-1 h-2 bg-[#2a2a3a] rounded-full overflow-hidden">
                  <motion.div className={`h-full ${bar} rounded-full`}
                    initial={{ width: 0 }} animate={{ width: `${total ? (count / total) * 100 : 0}%` }} transition={{ duration: 0.8 }} />
                </div>
                <span className={`font-bold text-sm w-12 text-right ${color}`}>{count}/{total}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-[#2a2a3a] flex justify-between text-sm">
            <span className="text-gray-500">Total XP</span>
            <span className="text-yellow-400 font-bold flex items-center gap-1"><Zap size={13} />{user.xp.toLocaleString()}</span>
          </div>
        </div>

        {/* Skill tree */}
        <div className="bg-[#16161f] border border-[#2a2a3a] rounded-xl p-5">
          <h2 className="font-bold text-white mb-4">🌳 Skill Tree</h2>
          <SkillTree skills={user.skills} />
        </div>
      </div>

      {/* Login history — recent sign-ins + new-device alerts */}
      <LoginHistory />

      {/* Activity heatmap */}
      <div className="bg-[#16161f] border border-[#2a2a3a] rounded-xl p-5">
        <h2 className="font-bold text-white mb-4">📅 Activity (Last 12 Weeks)</h2>
        <MiniHeatmap />
      </div>

      {/* Submission history */}
      <div className="bg-[#16161f] border border-[#2a2a3a] rounded-xl p-5">
        <h2 className="font-bold text-white mb-4">📋 Submission History</h2>
        {allSubs.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-6">No submissions yet. <Link href="/problems" className="text-yellow-400 hover:underline">Start solving!</Link></p>
        ) : (
          <div className="space-y-2">
            {allSubs.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3 py-2.5 px-3 bg-[#0d0d14] rounded-lg border border-[#1e1e2a] text-sm">
                {statusIcon(s.status)}
                <span className={`font-semibold text-xs w-32 shrink-0 ${statusColor(s.status)}`}>{s.status}</span>
                <Link href={`/problems/${s.problemId}`} className="text-gray-300 hover:text-yellow-400 transition-colors flex-1 truncate">{s.problemTitle}</Link>
                <span className="text-gray-600 text-xs shrink-0 hidden sm:block">{s.language}</span>
                {s.runtime !== "—" && <span className="text-gray-500 text-xs shrink-0 hidden sm:block">{s.runtime}</span>}
                {s.xpEarned > 0 && <span className="text-yellow-400 text-xs font-bold shrink-0 flex items-center gap-0.5"><Zap size={11} />+{s.xpEarned}</span>}
                <span className="text-gray-600 text-xs shrink-0">{new Date(s.timestamp).toLocaleDateString()}</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Solved problems */}
      {solved.length > 0 && (
        <div className="bg-[#16161f] border border-[#2a2a3a] rounded-xl p-5">
          <h2 className="font-bold text-white mb-4">✅ Solved Problems</h2>
          <div className="space-y-2">
            {solved.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3 py-2 border-b border-[#1e1e2a] last:border-0">
                <CheckCircle2 size={15} className="text-green-400 shrink-0" />
                <Link href={`/problems/${p.id}`} className="text-gray-300 hover:text-yellow-400 transition-colors flex-1 text-sm">{p.id}. {p.title}</Link>
                <DifficultyBadge difficulty={p.difficulty} />
                <span className="text-yellow-400 text-xs font-bold flex items-center gap-0.5"><Zap size={11} />+{p.xpReward}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
