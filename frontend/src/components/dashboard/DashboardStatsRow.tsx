import { memo } from "react";
import { Flame } from "lucide-react";
import type { Stats } from "../../store/statStore";

interface Props {
  stats: Stats;
}

export const DashboardStatsRow = memo(({ stats }: Props) => (
  <div className="mt-6 grid grid-cols-2 gap-3">
    <div className="bg-surface border border-line p-4 rounded-2xl shadow-[var(--sf-card-shadow)] text-center">
      <div className="font-display text-[1.8rem] font-bold text-ink tabular-nums">
        {stats.totalCompletions}
      </div>
      <p className="text-[0.75rem] sm:text-[0.8rem] text-ink-mute mt-1">Total Completions</p>
    </div>

    <div className="bg-surface border border-line p-4 rounded-2xl shadow-[var(--sf-card-shadow)] text-center">
      <div className="flex justify-center items-center gap-1 text-ember font-bold text-[1.8rem] tabular-nums">
        <Flame size={18} />
        {stats.bestStreak}
      </div>
      <p className="text-[0.75rem] sm:text-[0.8rem] text-ink-mute mt-1">Best Streak</p>
    </div>
  </div>
));

DashboardStatsRow.displayName = 'DashboardStatsRow';
