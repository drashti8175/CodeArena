"use client";
import { motion } from "framer-motion";
import { SkillBranch } from "@/types";

const SKILL_META: Record<SkillBranch, { icon: string; color: string }> = {
  DP:             { icon: "🧩", color: "from-purple-600 to-purple-400" },
  Graphs:         { icon: "🕸️", color: "from-blue-600 to-blue-400" },
  Trees:          { icon: "🌳", color: "from-green-600 to-green-400" },
  Greedy:         { icon: "⚡", color: "from-yellow-600 to-yellow-400" },
  "Binary Search":{ icon: "🔍", color: "from-cyan-600 to-cyan-400" },
  Strings:        { icon: "🔤", color: "from-pink-600 to-pink-400" },
  Arrays:         { icon: "📦", color: "from-orange-600 to-orange-400" },
  Math:           { icon: "🔢", color: "from-indigo-600 to-indigo-400" },
};

export default function SkillTree({ skills }: { skills: Partial<Record<SkillBranch, number>> }) {
  const entries = Object.entries(SKILL_META) as [SkillBranch, { icon: string; color: string }][];
  return (
    <div className="grid grid-cols-1 gap-2.5">
      {entries.map(([skill, { icon, color }], i) => {
        const level = skills[skill] ?? 0;
        return (
          <div key={skill} className="flex items-center gap-3">
            <span className="text-lg w-7 shrink-0">{icon}</span>
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="text-xs text-gray-400">{skill}</span>
                <span className="text-xs text-gray-500">Lv.{level}</span>
              </div>
              <div className="h-1.5 bg-[#2a2a3a] rounded-full overflow-hidden">
                <motion.div className={`h-full rounded-full bg-gradient-to-r ${color}`}
                  initial={{ width: 0 }} animate={{ width: `${(level / 10) * 100}%` }}
                  transition={{ duration: 0.7, delay: i * 0.06 }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
