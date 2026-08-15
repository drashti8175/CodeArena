"use client";
import { HeatmapDay } from "@/types";

interface Props { data: HeatmapDay[] }

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["", "Mon", "", "Wed", "", "Fri", ""];

function getColor(count: number) {
  if (count === 0) return "bg-gray-800";
  if (count === 1) return "bg-green-900";
  if (count === 2) return "bg-green-700";
  if (count === 3) return "bg-green-600";
  return "bg-green-500";
}

export default function ActivityHeatmap({ data }: Props) {
  // Build weeks grid
  const weeks: (HeatmapDay | null)[][] = [];
  let week: (HeatmapDay | null)[] = [];

  // Pad start
  const firstDay = new Date(data[0].date).getDay();
  for (let i = 0; i < firstDay; i++) week.push(null);

  for (const day of data) {
    week.push(day);
    if (week.length === 7) { weeks.push(week); week = []; }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  // Month labels
  const monthLabels: { label: string; col: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((w, wi) => {
    const firstReal = w.find(d => d !== null);
    if (firstReal) {
      const m = new Date(firstReal.date).getMonth();
      if (m !== lastMonth) { monthLabels.push({ label: MONTHS[m], col: wi }); lastMonth = m; }
    }
  });

  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex gap-3">
        {/* Day labels */}
        <div className="flex flex-col gap-[3px] pt-5">
          {DAYS.map((d, i) => (
            <div key={i} className="h-[12px] text-[10px] text-gray-600 leading-none flex items-center">{d}</div>
          ))}
        </div>

        {/* Grid */}
        <div>
          {/* Month labels */}
          <div className="flex gap-[3px] mb-1 h-4">
            {weeks.map((_, wi) => {
              const ml = monthLabels.find(m => m.col === wi);
              return (
                <div key={wi} className="w-[12px] text-[10px] text-gray-600 leading-none">
                  {ml ? ml.label : ""}
                </div>
              );
            })}
          </div>

          {/* Cells */}
          <div className="flex gap-[3px]">
            {weeks.map((w, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {w.map((day, di) => (
                  <div
                    key={di}
                    title={day ? `${day.date}: ${day.count} submission${day.count !== 1 ? "s" : ""}` : ""}
                    className={`heatmap-cell ${day ? getColor(day.count) : "opacity-0"}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 justify-end">
        <span className="text-xs text-gray-600">{total} submissions this year</span>
        <span className="text-xs text-gray-600 ml-2">Less</span>
        {["bg-gray-800", "bg-green-900", "bg-green-700", "bg-green-600", "bg-green-500"].map((c, i) => (
          <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
        ))}
        <span className="text-xs text-gray-600">More</span>
      </div>
    </div>
  );
}
