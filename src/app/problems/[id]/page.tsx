"use client";
import { useState, useEffect, useRef, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/store/GameContext";
import DifficultyBadge from "@/components/ui/DifficultyBadge";
import { Language, Submission } from "@/types";
import {
  Play, Send, ChevronLeft, Clock, Lightbulb, RotateCcw,
  CheckCircle2, XCircle, AlertCircle, ChevronDown, ChevronUp, Zap, BookOpen, History
} from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

const LANGUAGES: { value: Language; label: string }[] = [
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "cpp", label: "C++" },
  { value: "java", label: "Java" },
];

type Tab = "description" | "hints" | "submissions";
type ResultTab = "testcases" | "result";

function useTimer() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(true);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (running) ref.current = setInterval(() => setSeconds(s => s + 1), 1000);
    else if (ref.current) clearInterval(ref.current);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [running]);
  const fmt = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  return { fmt, pause: () => setRunning(false), reset: () => { setSeconds(0); setRunning(true); } };
}

export default function ProblemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { problems, user, submitSolution } = useGame();
  const problem = problems.find(p => p.id === id);

  const [lang, setLang] = useState<Language>("javascript");
  const [code, setCode] = useState("");
  const [tab, setTab] = useState<Tab>("description");
  const [resultTab, setResultTab] = useState<ResultTab>("testcases");
  const [submitting, setSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<Submission | null>(null);
  const [showHint, setShowHint] = useState<number | null>(null);
  const [bottomOpen, setBottomOpen] = useState(false);
  const [runOutput, setRunOutput] = useState<string | null>(null);
  const timer = useTimer();

  useEffect(() => {
    if (problem) {
      const starter = problem.starterCode?.[lang] ?? `// Write your ${lang} solution here\n`;
      setCode(starter);
    }
  }, [problem, lang]);

  if (!problem) return (
    <div className="flex items-center justify-center h-[80vh] text-gray-500">
      Problem not found. <Link href="/problems" className="text-yellow-400 ml-2 hover:underline">Back to problems</Link>
    </div>
  );

  const isSolved = user.solvedProblems.includes(problem.id);
  const mySubmissions = (user.submissions ?? []).filter(s => s.problemId === problem.id);

  const handleRun = () => {
    setBottomOpen(true);
    setResultTab("testcases");
    setRunOutput("Running test cases...");
    setTimeout(() => {
      setRunOutput(code.trim().length > 15
        ? `✓ Test case 1 passed\n✓ Test case 2 passed\n\nAll visible test cases passed!`
        : `✗ Test case 1 failed\nExpected: ${problem.examples[0]?.output}\nGot: undefined`
      );
    }, 1000);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    timer.pause();
    setBottomOpen(true);
    setResultTab("result");
    const result = await submitSolution(problem.id, lang, code);
    setLastResult(result);
    setSubmitting(false);
  };

  const statusColor = (s: string) => {
    if (s === "Accepted") return "text-green-400";
    if (s === "Wrong Answer") return "text-red-400";
    if (s === "Time Limit Exceeded") return "text-yellow-400";
    return "text-orange-400";
  };

  const statusIcon = (s: string) => {
    if (s === "Accepted") return <CheckCircle2 size={16} className="text-green-400" />;
    if (s === "Wrong Answer") return <XCircle size={16} className="text-red-400" />;
    return <AlertCircle size={16} className="text-yellow-400" />;
  };

  return (
    <div className="h-[calc(100vh-56px)] flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0d0d14] border-b border-[#2a2a3a] shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/problems" className="flex items-center gap-1 text-gray-400 hover:text-white text-sm transition-colors">
            <ChevronLeft size={16} /> Problems
          </Link>
          <span className="text-[#2a2a3a]">|</span>
          <span className="text-white font-semibold text-sm">{problem.id}. {problem.title}</span>
          <DifficultyBadge difficulty={problem.difficulty} />
          {isSolved && <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full"><CheckCircle2 size={11} /> Solved</span>}
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1.5 text-gray-400 bg-[#1e1e2a] px-3 py-1 rounded-lg border border-[#2a2a3a]">
            <Clock size={13} />
            <span className="font-mono text-white">{timer.fmt}</span>
          </div>
          <span className="text-yellow-400 text-xs font-bold flex items-center gap-1"><Zap size={12} />+{problem.xpReward} XP</span>
        </div>
      </div>

      {/* Main split pane */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT — Problem description */}
        <div className="w-[45%] min-w-[320px] flex flex-col border-r border-[#2a2a3a] overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-[#2a2a3a] bg-[#0d0d14] shrink-0">
            {([
              { key: "description", label: "Description", icon: BookOpen },
              { key: "hints", label: `Hints (${problem.hints?.length ?? 0})`, icon: Lightbulb },
              { key: "submissions", label: `Submissions (${mySubmissions.length})`, icon: History },
            ] as { key: Tab; label: string; icon: React.ElementType }[]).map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setTab(key)}
                className={clsx("flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
                  tab === key ? "border-yellow-400 text-yellow-400" : "border-transparent text-gray-500 hover:text-gray-300")}>
                <Icon size={14} />{label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {tab === "description" && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex gap-1.5 flex-wrap">
                    {problem.tags.map(t => (
                      <span key={t} className="text-xs bg-[#2a2a3a] text-gray-300 px-2 py-0.5 rounded">{t}</span>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">Acceptance: <span className="text-white">{problem.acceptanceRate}%</span></span>
                </div>

                <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{problem.description}</div>

                {problem.examples.map((ex, i) => (
                  <div key={i}>
                    <p className="text-white font-semibold text-sm mb-2">Example {i + 1}:</p>
                    <div className="bg-[#0d0d14] border border-[#2a2a3a] rounded-lg p-3 font-mono text-sm space-y-1">
                      <div><span className="text-gray-500">Input: </span><span className="text-green-400">{ex.input}</span></div>
                      <div><span className="text-gray-500">Output: </span><span className="text-blue-400">{ex.output}</span></div>
                      {ex.explanation && <div className="text-gray-400 text-xs pt-1 border-t border-[#2a2a3a] mt-1">Explanation: {ex.explanation}</div>}
                    </div>
                  </div>
                ))}

                {problem.constraints && problem.constraints.length > 0 && (
                  <div>
                    <p className="text-white font-semibold text-sm mb-2">Constraints:</p>
                    <ul className="space-y-1">
                      {problem.constraints.map((c, i) => (
                        <li key={i} className="text-gray-400 text-sm font-mono flex items-start gap-2">
                          <span className="text-[#2a2a3a] mt-1">•</span>{c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {(problem.companies?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-white font-semibold text-sm mb-2">Companies:</p>
                    <div className="flex gap-2 flex-wrap">
                      {problem.companies!.map(c => (
                        <span key={c} className="text-xs bg-[#1e1e2a] border border-[#2a2a3a] text-gray-300 px-2 py-1 rounded">{c}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === "hints" && (
              <div className="space-y-3">
                <p className="text-gray-500 text-sm">Click to reveal hints one by one.</p>
                {(problem.hints ?? []).map((hint, i) => (
                  <div key={i} className="border border-[#2a2a3a] rounded-lg overflow-hidden">
                    <button onClick={() => setShowHint(showHint === i ? null : i)}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-300 hover:bg-[#1e1e2a] transition-colors">
                      <span className="flex items-center gap-2"><Lightbulb size={14} className="text-yellow-400" />Hint {i + 1}</span>
                      {showHint === i ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    <AnimatePresence>
                      {showHint === i && (
                        <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                          <p className="px-4 pb-3 text-sm text-gray-400">{hint}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            )}

            {tab === "submissions" && (
              <div className="space-y-2">
                {mySubmissions.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-8">No submissions yet. Try solving the problem!</p>
                ) : (
                  mySubmissions.map(s => (
                    <div key={s.id} className="flex items-center gap-3 p-3 bg-[#0d0d14] border border-[#2a2a3a] rounded-lg text-sm">
                      {statusIcon(s.status)}
                      <span className={`font-semibold ${statusColor(s.status)}`}>{s.status}</span>
                      <span className="text-gray-500 text-xs ml-auto">{s.language}</span>
                      {s.runtime !== "—" && <span className="text-gray-400 text-xs">{s.runtime}</span>}
                      <span className="text-gray-600 text-xs">{new Date(s.timestamp).toLocaleDateString()}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — Editor + Results */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Editor toolbar */}
          <div className="flex items-center justify-between px-4 py-2 bg-[#0d0d14] border-b border-[#2a2a3a] shrink-0">
            <select value={lang} onChange={e => setLang(e.target.value as Language)}
              className="bg-[#1e1e2a] border border-[#2a2a3a] text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-yellow-500/40 cursor-pointer">
              {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
            <div className="flex items-center gap-2">
              <button onClick={() => { const s = problem.starterCode?.[lang] ?? ""; setCode(s); }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-[#1e1e2a] border border-[#2a2a3a] rounded-lg hover:border-[#3a3a4a] transition-colors">
                <RotateCcw size={12} /> Reset
              </button>
              <button onClick={handleRun}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#1e1e2a] border border-[#2a2a3a] rounded-lg hover:border-green-500/40 hover:text-green-400 transition-colors">
                <Play size={12} /> Run
              </button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={handleSubmit} disabled={submitting}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-gradient-to-r from-yellow-500 to-orange-500 text-black rounded-lg disabled:opacity-60 transition-opacity">
                <Send size={12} />
                {submitting ? "Judging..." : "Submit"}
              </motion.button>
            </div>
          </div>

          {/* Code editor */}
          <div className="flex-1 overflow-hidden relative">
            {/* Line numbers */}
            <div className="absolute left-0 top-0 bottom-0 w-10 bg-[#0d0d14] border-r border-[#1e1e2a] flex flex-col pt-4 overflow-hidden pointer-events-none z-10">
              {code.split("\n").map((_, i) => (
                <div key={i} className="text-xs text-gray-600 text-right pr-2 leading-[1.6] font-mono" style={{ fontSize: 13 }}>{i + 1}</div>
              ))}
            </div>
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Tab") {
                  e.preventDefault();
                  const s = e.currentTarget.selectionStart;
                  const end = e.currentTarget.selectionEnd;
                  const newCode = code.substring(0, s) + "  " + code.substring(end);
                  setCode(newCode);
                  setTimeout(() => { e.currentTarget.selectionStart = e.currentTarget.selectionEnd = s + 2; }, 0);
                }
              }}
              className="code-editor absolute inset-0 w-full h-full bg-[#0d0d14] text-gray-200 resize-none focus:outline-none pl-12 pr-4 pt-4 pb-4"
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
            />
          </div>

          {/* Bottom panel — test cases / results */}
          <div className={clsx("border-t border-[#2a2a3a] bg-[#0d0d14] transition-all duration-200 shrink-0", bottomOpen ? "h-52" : "h-10")}>
            <div className="flex items-center justify-between px-4 h-10 border-b border-[#1e1e2a]">
              <div className="flex gap-1">
                {(["testcases", "result"] as ResultTab[]).map(t => (
                  <button key={t} onClick={() => { setResultTab(t); setBottomOpen(true); }}
                    className={clsx("px-3 py-1 text-xs font-semibold rounded transition-colors capitalize",
                      resultTab === t && bottomOpen ? "text-white bg-[#2a2a3a]" : "text-gray-500 hover:text-gray-300")}>
                    {t === "testcases" ? "Test Cases" : "Result"}
                  </button>
                ))}
              </div>
              <button onClick={() => setBottomOpen(o => !o)} className="text-gray-500 hover:text-white transition-colors">
                {bottomOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </button>
            </div>

            {bottomOpen && (
              <div className="p-4 overflow-y-auto h-[calc(100%-40px)]">
                {resultTab === "testcases" && (
                  <div className="space-y-2">
                    {runOutput ? (
                      <pre className={clsx("text-xs font-mono whitespace-pre-wrap", runOutput.includes("✓") ? "text-green-400" : "text-red-400")}>{runOutput}</pre>
                    ) : (
                      problem.examples.slice(0, 2).map((ex, i) => (
                        <div key={i} className="bg-[#1e1e2a] border border-[#2a2a3a] rounded-lg p-3 font-mono text-xs space-y-1">
                          <div><span className="text-gray-500">Input: </span><span className="text-green-400">{ex.input}</span></div>
                          <div><span className="text-gray-500">Expected: </span><span className="text-blue-400">{ex.output}</span></div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {resultTab === "result" && (
                  <AnimatePresence mode="wait">
                    {submitting ? (
                      <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 text-gray-400 text-sm">
                        <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                        Judging your solution...
                      </motion.div>
                    ) : lastResult ? (
                      <motion.div key="result" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                        className={clsx("p-4 rounded-xl border", lastResult.status === "Accepted" ? "bg-green-900/20 border-green-500/30 glow-green" : "bg-red-900/20 border-red-500/30 glow-red")}>
                        <div className="flex items-center gap-3 mb-2">
                          {statusIcon(lastResult.status)}
                          <span className={`font-black text-lg ${statusColor(lastResult.status)}`}>{lastResult.status}</span>
                          {lastResult.status === "Accepted" && !isSolved && (
                            <span className="ml-auto text-yellow-400 font-bold text-sm flex items-center gap-1"><Zap size={14} />+{lastResult.xpEarned} XP earned!</span>
                          )}
                        </div>
                        {lastResult.status === "Accepted" && (
                          <div className="flex gap-6 text-sm text-gray-400">
                            <span>Runtime: <span className="text-white font-semibold">{lastResult.runtime}</span></span>
                            <span>Memory: <span className="text-white font-semibold">{lastResult.memory}</span></span>
                            <span>Language: <span className="text-white font-semibold">{lastResult.language}</span></span>
                          </div>
                        )}
                      </motion.div>
                    ) : (
                      <p className="text-gray-500 text-sm">Submit your solution to see results.</p>
                    )}
                  </AnimatePresence>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
