"use client";
import { motion } from "framer-motion";
import { STREAK_THEMES } from "@/lib/data";
import { StreakTheme } from "@/types";

interface StreakBadgeProps {
  streak: number;
  theme: StreakTheme;
}

export default function StreakBadge({ streak, theme }: StreakBadgeProps) {
  const t = STREAK_THEMES[theme];
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r ${t.color} shadow-lg ${t.glow}`}
    >
      <motion.span
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="text-2xl"
      >
        {t.icon}
      </motion.span>
      <div>
        <div className="text-white font-black text-xl leading-none">{streak}</div>
        <div className="text-white/70 text-xs">day streak</div>
      </div>
    </motion.div>
  );
}
