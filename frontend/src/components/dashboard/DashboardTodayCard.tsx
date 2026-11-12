import { memo } from "react";
import { TrendingUp } from "lucide-react";
import type { DashboardTodayStats } from "../../store/statStore";

interface Props {
  today: DashboardTodayStats;
}

export const DashboardTodayCard = memo(({ today }: Props) => (
  <div className="mt-6 bg-surface border border-line p-5 rounded-2xl shadow-[var(--sf-card-shadow)]">
    <div className="flex justify-between items-center">
      <div>
        <p className="text-[0.75rem] sm:text-[0.8rem] text-ink-mute">Today</p>
        <h2 className="font-display text-[1.8rem] font-bold text-ink tabular-nums">
          {today.completedHabits} / {today.totalHabits}
        </h2>
      </div>

      <div className="flex items-center gap-2 text-brand font-semibold text-[0.85rem] sm:text-[0.9rem]">
        <TrendingUp size={16} />
        {today.completionRate}%
      </div>
    </div>
  </div>
));

DashboardTodayCard.displayName = 'DashboardTodayCard';
