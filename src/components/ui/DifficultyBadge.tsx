import { Difficulty } from "@/types";
import clsx from "clsx";

const styles: Record<Difficulty, string> = {
  Easy: "bg-green-500/20 text-green-400 border-green-500/30",
  Medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Hard: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span className={clsx("text-xs font-semibold px-2 py-0.5 rounded-full border", styles[difficulty])}>
      {difficulty}
    </span>
  );
}
