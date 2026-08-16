"use client";
import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { useAuth } from "@/store/AuthContext";
import { Language, Problem, Submission, SubmissionStatus, User } from "@/types";
import { MOCK_USER, MOCK_PROBLEMS, XP_REWARDS, getRankFromXP } from "@/lib/data";
import { db } from "@/lib/firebase/config";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";

interface GameState {
  user: User;
  problems: Problem[];
  editorFontSize: number;
  submitSolution: (problemId: string, language: Language, code: string) => Promise<Submission>;
  resetProblem: (problemId: string) => void;
  updateUserLocally: (patch: Partial<User>) => void;
  setEditorFontSize: (size: number) => void;
}

const GameContext = createContext<GameState | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const { arenaUser } = useAuth();

  const [user, setUser] = useState<User>(MOCK_USER);
  const [problems, setProblems] = useState<Problem[]>(MOCK_PROBLEMS);
  const [editorFontSize, setEditorFontSizeState] = useState(14);

  // Sync arenaUser into game user
  useEffect(() => {
    if (arenaUser) {
      setUser(prev => ({
        ...prev,
        ...arenaUser,
      } as User));
    } else {
      setUser(MOCK_USER);
    }
  }, [arenaUser]);

  // Load font size from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("editor_font_size");
    if (stored) setEditorFontSizeState(Number(stored));
  }, []);

  // Apply font size as a CSS variable on <html> so the editor picks it up
  useEffect(() => {
    document.documentElement.style.setProperty("--editor-font-size", `${editorFontSize}px`);
  }, [editorFontSize]);

  const setEditorFontSize = useCallback((size: number) => {
    setEditorFontSizeState(size);
    localStorage.setItem("editor_font_size", String(size));
  }, []);

  // Allow settings page to patch user state in real time (e.g., avatar, streakTheme)
  const updateUserLocally = useCallback((patch: Partial<User>) => {
    setUser(prev => ({ ...prev, ...patch }));
  }, []);

  const submitSolution = useCallback(async (problemId: string, language: Language, code: string): Promise<Submission> => {
    await new Promise(r => setTimeout(r, 1800));

    const problem = problems.find(p => p.id === problemId)!;
    const alreadySolved = user.solvedProblems.includes(problemId);
    const isCorrect = code.trim().length > 20;
    const status: SubmissionStatus = isCorrect ? "Accepted" : "Wrong Answer";
    const xpEarned = isCorrect && !alreadySolved ? XP_REWARDS[problem.difficulty] : 0;

    const submission: Submission = {
      id: `s${Date.now()}`,
      problemId,
      problemTitle: problem.title,
      status,
      language,
      runtime: isCorrect ? `${Math.floor(Math.random() * 200 + 40)}ms` : "—",
      memory: isCorrect ? `${(Math.random() * 20 + 14).toFixed(1)}MB` : "—",
      timestamp: new Date().toISOString(),
      xpEarned,
    };

    if (isCorrect && !alreadySolved) {
      const newXP = user.xp + xpEarned;
      const newCoins = user.coins + problem.coinReward;
      const newRank = getRankFromXP(newXP);

      setUser(prev => ({
        ...prev,
        xp: newXP,
        coins: newCoins,
        rank: newRank,
        solvedProblems: [...prev.solvedProblems, problemId],
        streak: prev.streak + (prev.streak === 0 ? 1 : 0),
        submissions: [submission, ...(prev.submissions ?? [])],
      }));
      setProblems(prev => prev.map(p => p.id === problemId ? { ...p, solved: true } : p));

      // Persist to Firebase
      if (arenaUser?.uid) {
        updateDoc(doc(db, "users", arenaUser.uid), {
          xp: newXP,
          coins: newCoins,
          rank: newRank,
          solvedProblems: arrayUnion(problemId),
        }).catch(err => console.error("Firestore update failed:", err));
      }
    } else {
      setUser(prev => ({ ...prev, submissions: [submission, ...(prev.submissions ?? [])] }));
    }

    return submission;
  }, [problems, user, arenaUser]);

  const resetProblem = useCallback((problemId: string) => {
    setProblems(prev => prev.map(p => p.id === problemId ? { ...p, solved: false } : p));
    setUser(prev => ({
      ...prev,
      solvedProblems: prev.solvedProblems.filter(id => id !== problemId),
    }));
  }, []);

  return (
    <GameContext.Provider value={{ user, problems, editorFontSize, submitSolution, resetProblem, updateUserLocally, setEditorFontSize }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
