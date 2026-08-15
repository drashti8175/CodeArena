"use client";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useGame } from "@/store/GameContext";
import { Difficulty, SkillBranch } from "@/types";
import DifficultyBadge from "@/components/ui/DifficultyBadge";
import { Search, CheckCircle2, Circle, ChevronUp, ChevronDown, Zap, Lock } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

const DIFFS: (Difficulty | "All")[] = ["All", "Easy", "Medium", "Hard"];
const TAGS: (SkillBranch | "All")[] = ["All", "Arrays", "Strings", "DP", "Graphs", "Trees", "Greedy", "Binary Search", "Math"];
const STATUS = ["All", "Solved", "Unsolved"] as const;

type SortKey = "id" | "title" | "difficulty" | "acceptanceRate";
type SortDir = "asc" | "desc";

export default function ProblemsPage() {
  const { problems, user } = useGame();
  const [search, setSearch] = useState("");
  const [diff, setDiff] = useState<Difficulty | "All">("All");
  const [tag, setTag] = useState<SkillBranch | "All">("All");
  const [status, setStatus] = useState<typeof STATUS[number]>("All");
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: "id", dir: "asc" });

  const easy = problems.filter(p => p.difficulty === "Easy");
  const medium = problems.filter(p => p.difficulty === "Medium");
  const hard = problems.filter(p => p.difficulty === "Hard");
  const solvedEasy = easy.filter(p => user.solvedProblems.includes(p.id)).length;
  const solvedMedium = medium.filter(p => user.solvedProblems.includes(p.id)).length;
  const solvedHard = hard.filter(p => user.solvedProblems.includes(p.id)).length;

  const filtered = useMemo(() => {
    let list = problems.filter(p => {
      const solved = user.solvedProblems.includes(p.id);
      return (
        p.title.toLowerCase().includes(search.toLowerCase()) &&
        (diff === "All" || p.difficulty === diff) &&
        (tag === "All" || p.tags.includes(tag as SkillBranch)) &&
        (status === "All" || (status === "Solved" ? solved : !solved))
      );
    });
    list = [...list].sort((a, b) => {
      let va: string | number = a[sort.key] ?? 0;
      let vb: string | number = b[sort.key] ?? 0;
      if (sort.key === "difficulty") {
        const order = { Easy: 0, Medium: 1, Hard: 2 };
        va = order[a.difficulty]; vb = order[b.difficulty];
      }
      if (sort.key === "id") { va = parseInt(a.id); vb = parseInt(b.id); }
      return sort.dir === "asc" ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });
    return list;
  }, [problems, user.solvedProblems, search, diff, tag, status, sort]);

  const toggleSort = (key: SortKey) => {
    setSort(s => s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" });
  };

  const SortIcon = ({ k }: { k: SortKey }) => sort.key === k
    ? (sort.dir === "asc" ? <ChevronUp size={13} className="text-yellow-400" /> : <ChevronDown size={13} className="text-yellow-400" />)
    : <ChevronUp size={13} className="text-gray-600" />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Easy", solved: solvedEasy, total: easy.length, color: "text-green-400", bar: "bg-green-500", border: "border-green-500/20" },
          { label: "Medium", solved: solvedMedium, total: medium.length, color: "text-yellow-400", bar: "bg-yellow-500", border: "border-yellow-500/20" },
          { label: "Hard", solved: solvedHard, total: hard.length, color: "text-red-400", bar: "bg-red-500", border: "border-red-500/20" },
        ].map(({ label, solved, total, color, bar, border }) => (
          <div key={label} className={`bg-[#16161f] border ${border} rounded-xl p-4`}>
            <div className="flex justify-between items-center mb-2">
              <span className={`font-bold text-sm ${color}`}>{label}</span>
              <span className="text-white font-black text-lg">{solved}<span className="text-gray-500 font-normal text-sm">/{total}</span></span>
            </div>
            <div className="h-1.5 bg-[#2a2a3a] rounded-full overflow-hidden">
              <motion.div className={`h-full ${bar} rounded-full`} initial={{ width: 0 }} animate={{ width: `${total ? (solved / total) * 100 : 0}%` }} transition={{ duration: 0.8 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-[#16161f] border border-[#2a2a3a] rounded-xl p-4 mb-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search problems..."
              className="w-full bg-[#0d0d14] border border-[#2a2a3a] rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500/40 transition-colors" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {DIFFS.map(d => (
              <button key={d} onClick={() => setDiff(d)}
                className={clsx("px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border", diff === d ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" : "text-gray-400 border-[#2a2a3a] hover:border-[#3a3a4a] hover:text-white")}>
                {d}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {STATUS.map(s => (
              <button key={s} onClick={() => setStatus(s)}
                className={clsx("px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border", status === s ? "bg-blue-500/15 text-blue-400 border-blue-500/30" : "text-gray-400 border-[#2a2a3a] hover:border-[#3a3a4a] hover:text-white")}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {TAGS.map(t => (
            <button key={t} onClick={() => setTag(t)}
              className={clsx("px-2.5 py-1 rounded-full text-xs font-medium transition-all border", tag === t ? "bg-purple-500/15 text-purple-400 border-purple-500/30" : "text-gray-500 border-[#2a2a3a] hover:text-gray-300 hover:border-[#3a3a4a]")}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#16161f] border border-[#2a2a3a] rounded-xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[40px_1fr_120px_100px_80px_120px] gap-4 px-4 py-3 border-b border-[#2a2a3a] text-xs font-semibold text-gray-500 uppercase tracking-wide">
          <div className="text-center">
            <button onClick={() => toggleSort("id")} className="flex items-center gap-1 hover:text-gray-300"># <SortIcon k="id" /></button>
          </div>
          <button onClick={() => toggleSort("title")} className="flex items-center gap-1 hover:text-gray-300 text-left">Title <SortIcon k="title" /></button>
          <button onClick={() => toggleSort("difficulty")} className="flex items-center gap-1 hover:text-gray-300">Difficulty <SortIcon k="difficulty" /></button>
          <button onClick={() => toggleSort("acceptanceRate")} className="flex items-center gap-1 hover:text-gray-300">Acceptance <SortIcon k="acceptanceRate" /></button>
          <div>XP</div>
          <div>Companies</div>
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No problems match your filters</div>
        ) : (
          filtered.map((p, i) => {
            const solved = user.solvedProblems.includes(p.id);
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className={clsx(
                  "grid grid-cols-[40px_1fr_120px_100px_80px_120px] gap-4 px-4 py-3.5 border-b border-[#1e1e2a] items-center hover:bg-[#1e1e2a] transition-colors group",
                  i % 2 === 0 ? "bg-[#16161f]" : "bg-[#13131a]"
                )}
              >
                <div className="flex justify-center">
                  {solved
                    ? <CheckCircle2 size={16} className="text-green-400" />
                    : <Circle size={16} className="text-gray-600 group-hover:text-gray-400 transition-colors" />}
                </div>
                <div>
                  <Link href={`/problems/${p.id}`} className="text-sm font-medium text-gray-200 hover:text-yellow-400 transition-colors">
                    {p.id}. {p.title}
                  </Link>
                  <div className="flex gap-1.5 mt-1 flex-wrap">
                    {p.tags.map(t => (
                      <span key={t} className="text-xs text-gray-500 bg-[#2a2a3a] px-1.5 py-0.5 rounded">{t}</span>
                    ))}
                  </div>
                </div>
                <div><DifficultyBadge difficulty={p.difficulty} /></div>
                <div className="text-sm text-gray-400">{p.acceptanceRate}%</div>
                <div className="flex items-center gap-1 text-yellow-400 text-sm font-bold">
                  <Zap size={12} />+{p.xpReward}
                </div>
                <div className="flex gap-1 flex-wrap">
                  {(p.companies ?? []).slice(0, 2).map(c => (
                    <span key={c} className="text-xs text-gray-500 bg-[#2a2a3a] px-1.5 py-0.5 rounded">{c}</span>
                  ))}
                  {(p.companies?.length ?? 0) > 2 && (
                    <span className="text-xs text-gray-600">+{(p.companies?.length ?? 0) - 2}</span>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
      <div className="mt-3 text-xs text-gray-600 text-right">{filtered.length} problems</div>
    </div>
  );
}
