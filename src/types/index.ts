export type Rank = "Bronze" | "Silver" | "Gold" | "Diamond" | "Legend";
export type Difficulty = "Easy" | "Medium" | "Hard";
export type SkillBranch = "DP" | "Graphs" | "Trees" | "Greedy" | "Binary Search" | "Strings" | "Arrays" | "Math";
export type StreakTheme = "fire" | "ice" | "galaxy";
export type Language = "javascript" | "python" | "cpp" | "java";
export type SubmissionStatus = "Accepted" | "Wrong Answer" | "Time Limit Exceeded" | "Runtime Error" | "Pending";

export interface TestCase {
  input: string;
  output: string;
  explanation?: string;
}

export interface Submission {
  id: string;
  problemId: string;
  problemTitle: string;
  status: SubmissionStatus;
  language: Language;
  runtime: string;
  memory: string;
  timestamp: string;
  xpEarned: number;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earnedAt: string;
}

export interface User {
  id: string;
  username: string;
  avatar: string;
  rank: Rank;
  level: number;
  xp: number;
  xpToNext: number;
  coins: number;
  streak: number;
  streakTheme: StreakTheme;
  skills: Partial<Record<SkillBranch, number>>;
  solvedProblems: string[];
  joinedAt: string;
  submissions?: Submission[];
  acceptanceRate?: number;
  badges?: Badge[];
}

export interface Problem {
  id: string;
  title: string;
  difficulty: Difficulty;
  tags: SkillBranch[];
  xpReward: number;
  coinReward: number;
  solved: boolean;
  description: string;
  constraints?: string[];
  examples: TestCase[];
  hints?: string[];
  starterCode?: Partial<Record<Language, string>>;
  solution?: string;
  acceptanceRate: number;
  totalSubmissions: number;
  companies?: string[];
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  coinReward: number;
  progress: number;
  total: number;
  completed: boolean;
  type: "daily" | "weekly";
  icon?: string;
}

export interface LeaderboardEntry {
  rank: number;
  user: Pick<User, "id" | "username" | "avatar" | "level" | "xp" | "rank">;
  solvedCount: number;
  streak?: number;
  acceptanceRate?: number;
}

export interface HeatmapDay {
  date: string;
  count: number;
}
