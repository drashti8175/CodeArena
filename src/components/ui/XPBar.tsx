"use client";
import { motion } from "framer-motion";
import { getXPToNextRank, RANK_COLORS } from "@/lib/data";

export default function XPBar({ xp, level }: { xp: number; level: number }) {
  const { current, next, rank } = getXPToNextRank(xp);
  const pct = next === current ? 100 : Math.min(((xp - current) / (next - current)) * 100, 100);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1.5 text-xs">
        <span className="text-gray-400">Level <span className="text-white font-bold">{level}</span></span>
        <span className={`font-black ${RANK_COLORS[rank]}`}>{rank}</span>
        <span className="text-gray-400">{xp.toLocaleString()} / {next.toLocaleString()} XP</span>
      </div>
      <div className="h-2.5 bg-[#1e1e2a] rounded-full overflow-hidden border border-[#2a2a3a]">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-orange-500"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
