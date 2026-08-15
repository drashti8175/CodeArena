"use client";
import { motion } from "framer-motion";
import { Problem } from "@/types";
import DifficultyBadge from "@/components/ui/DifficultyBadge";
import { CheckCircle, Zap, Coins } from "lucide-react";
import Link from "next/link";

export default function ProblemCard({ problem }: { problem: Problem }) {
  return (
    <motion.div
      whileHover={{ x: 4 }}
      className={`flex items-center gap-4 p-4 rounded-xl border transition-colors cursor-pointer
        ${problem.solved ? "border-green-500/30 bg-green-900/10" : "border-gray-700 bg-gray-800/40 hover:border-gray-600"}`}
    >
      <div className="w-8 flex justify-center">
        {problem.solved
          ? <CheckCircle size={20} className="text-green-400" />
          : <div className="w-5 h-5 rounded-full border-2 border-gray-600" />}
      </div>
      <div className="flex-1 min-w-0">
        <Link href={`/problems/${problem.id}`} className="text-white font-semibold hover:text-yellow-400 transition-colors">
          {problem.title}
        </Link>
        <div className="flex gap-2 mt-1 flex-wrap">
          {problem.tags.map(tag => (
            <span key={tag} className="text-xs text-gray-400 bg-gray-700/50 px-2 py-0.5 rounded-full">{tag}</span>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <DifficultyBadge difficulty={problem.difficulty} />
        <span className="flex items-center gap-1 text-xs text-yellow-400"><Zap size={12} />+{problem.xpReward}</span>
      </div>
    </motion.div>
  );
}
