"use client";
import { motion } from "framer-motion";
import { Quest } from "@/types";
import { Zap, Coins } from "lucide-react";

export default function QuestCard({ quest }: { quest: Quest }) {
  const pct = (quest.progress / quest.total) * 100;
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className={`p-4 rounded-xl border ${quest.completed ? "border-green-500/30 bg-green-900/10" : "border-gray-800 bg-gray-900"}`}
    >
      <div className="flex items-start gap-3">
        {quest.icon && <span className="text-xl shrink-0 mt-0.5">{quest.icon}</span>}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${quest.type === "daily" ? "bg-blue-500/15 text-blue-400" : "bg-purple-500/15 text-purple-400"}`}>
              {quest.type === "daily" ? "DAILY" : "WEEKLY"}
            </span>
            {quest.completed && <span className="text-green-400 text-xs font-bold">✓ Complete</span>}
          </div>
          <p className="text-white font-semibold text-sm">{quest.title}</p>
          <p className="text-gray-500 text-xs mb-2">{quest.description}</p>
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden mb-2">
            <motion.div
              className={`h-full rounded-full ${quest.completed ? "bg-green-500" : "bg-gradient-to-r from-blue-500 to-purple-500"}`}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-xs">{quest.progress}/{quest.total}</span>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1 text-yellow-400"><Zap size={11} />{quest.xpReward} XP</span>
              <span className="text-amber-400">🪙 {quest.coinReward}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
