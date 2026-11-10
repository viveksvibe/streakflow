import { memo } from "react";
import { Flame } from "lucide-react";
import type { LeaderboardItem } from "../../store/statStore";

interface Props {
  leaderboard: LeaderboardItem[];
}

export const DashboardLeaderboard = memo(({ leaderboard }: Props) => (
  <div className="mt-6 bg-surface border border-line p-5 rounded-2xl shadow-[var(--sf-card-shadow)]">
    <h3 className="font-display font-semibold mb-4 text-ink">Leaderboard</h3>

    <div className="flex flex-col gap-3">
      {leaderboard.map((h, index) => (
        <div
          key={h.habitId}
          className="flex items-center justify-between p-3 bg-well rounded-xl"
        >
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-brand text-on-brand text-[11px] font-bold flex items-center justify-center shrink-0 tabular-nums">
              {index + 1}
            </span>
            <span className="text-[1.1rem] sm:text-lg" aria-hidden="true">{h.icon}</span>
            <span className="font-medium text-ink text-[0.9rem] sm:text-[0.95rem]">
              {h.name}
            </span>
          </div>

          <div className="flex items-center gap-1 text-ember font-semibold tabular-nums text-[0.9rem] sm:text-[0.95rem]">
            <Flame size={14} />
            {h.currentStreak}
          </div>
        </div>
      ))}
    </div>
  </div>
));

DashboardLeaderboard.displayName = 'DashboardLeaderboard';
