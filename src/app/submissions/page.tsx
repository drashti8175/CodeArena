"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useGame } from "@/store/GameContext";
import { CheckCircle2, XCircle, AlertCircle, Zap, Search } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { SubmissionStatus } from "@/types";

const STATUS_FILTERS: (SubmissionStatus | "All")[] = ["All", "Accepted", "Wrong Answer", "Time Limit Exceeded", "Runtime Error"];

const statusIcon = (s: string) => {
  if (s === "Accepted") return <CheckCircle2 size={15} className="text-green-400 shrink-0" />;
  if (s === "Wrong Answer") return <XCircle size={15} className="text-red-400 shrink-0" />;
  return <AlertCircle size={15} className="text-yellow-400 shrink-0" />;
};
const statusColor = (s: string) => s === "Accepted" ? "text-green-400" : s === "Wrong Answer" ? "text-red-400" : "text-yellow-400";

export default function SubmissionsPage() {
  const { user } = useGame();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<SubmissionStatus | "All">("All");
  const allSubs = user.submissions ?? [];

  const filtered = allSubs.filter(s =>
    s.problemTitle.toLowerCase().includes(search.toLowerCase()) &&
    (filter === "All" || s.status === filter)
  );

  const accepted = allSubs.filter(s => s.status === "Accepted").length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-white mb-1">My Submissions</h1>
        <p className="text-gray-500">{accepted}/{allSubs.length} accepted · {allSubs.length ? Math.round((accepted / allSubs.length) * 100) : 0}% acceptance rate</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by problem..."
            className="w-full bg-[#16161f] border border-[#2a2a3a] rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500/40" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={clsx("px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                filter === s ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" : "text-gray-500 border-[#2a2a3a] hover:text-gray-300 hover:border-[#3a3a4a]")}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          {allSubs.length === 0 ? (
            <><p className="text-lg mb-2">No submissions yet</p><Link href="/problems" className="text-yellow-400 hover:underline">Start solving problems!</Link></>
          ) : "No submissions match your filters"}
        </div>
      ) : (
        <div className="bg-[#16161f] border border-[#2a2a3a] rounded-xl overflow-hidden">
          <div className="grid grid-cols-[1fr_120px_80px_80px_80px_100px] gap-3 px-4 py-2.5 border-b border-[#2a2a3a] text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <div>Problem</div><div>Status</div><div>Language</div><div>Runtime</div><div>Memory</div><div>Date</div>
          </div>
          {filtered.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
              className={clsx("grid grid-cols-[1fr_120px_80px_80px_80px_100px] gap-3 px-4 py-3 border-b border-[#1e1e2a] items-center hover:bg-[#1e1e2a] transition-colors text-sm",
                i % 2 === 0 ? "bg-[#16161f]" : "bg-[#13131a]")}>
              <div className="flex items-center gap-2 min-w-0">
                {statusIcon(s.status)}
                <Link href={`/problems/${s.problemId}`} className="text-gray-300 hover:text-yellow-400 transition-colors truncate">{s.problemTitle}</Link>
                {s.xpEarned > 0 && <span className="text-yellow-400 text-xs font-bold shrink-0 flex items-center gap-0.5"><Zap size={11} />+{s.xpEarned}</span>}
              </div>
              <div className={`font-semibold text-xs ${statusColor(s.status)}`}>{s.status}</div>
              <div className="text-gray-400 text-xs">{s.language}</div>
              <div className="text-gray-400 text-xs">{s.runtime}</div>
              <div className="text-gray-400 text-xs">{s.memory}</div>
              <div className="text-gray-600 text-xs">{new Date(s.timestamp).toLocaleDateString()}</div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
