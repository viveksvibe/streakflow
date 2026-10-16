import { Flame } from "lucide-react";
import type { LeaderboardItem } from "../../store/statStore";

interface Props {
  leaderboard: LeaderboardItem[];
}

export const DashboardLeaderboard = ({ leaderboard }: Props) => (
  <div className="mt-6 bg-white p-5 rounded-2xl shadow-sm">
    <h3 className="font-semibold mb-4">Leaderboard</h3>

    <div className="flex flex-col gap-3">
      {leaderboard.map((h, index) => (
        <div
          key={h.habitId}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">
              {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
            </span>
            <span className="text-lg">{h.icon}</span>
            <span className="font-medium text-gray-700">
              {h.name}
            </span>
          </div>

          <div className="flex items-center gap-1 text-orange-500 font-semibold">
            <Flame size={14} />
            {h.currentStreak}
          </div>
        </div>
      ))}
    </div>
  </div>
);
