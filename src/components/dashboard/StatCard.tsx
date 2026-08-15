"use client";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}

export default function StatCard({ icon, label, value, sub, color = "text-white" }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -2 }}
      className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 flex items-center gap-3"
    >
      <div className="text-2xl">{icon}</div>
      <div>
        <p className="text-gray-400 text-xs">{label}</p>
        <p className={`font-black text-xl ${color}`}>{value}</p>
        {sub && <p className="text-gray-500 text-xs">{sub}</p>}
      </div>
    </motion.div>
  );
}
