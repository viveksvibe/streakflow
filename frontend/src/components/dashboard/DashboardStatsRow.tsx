import { Flame } from "lucide-react";
import type { Stats } from "../../store/statStore";

interface Props {
  stats: Stats;
}

export const DashboardStatsRow = ({ stats }: Props) => (
  <div className="mt-6 grid grid-cols-2 gap-3">
    <div className="bg-white p-4 rounded-2xl shadow-sm text-center">
      <div className="text-2xl font-bold text-gray-800">
        {stats.totalCompletions}
      </div>
      <p className="text-sm text-gray-500">Total Completions</p>
    </div>

    <div className="bg-white p-4 rounded-2xl shadow-sm text-center">
      <div className="flex justify-center items-center gap-1 text-orange-500 font-bold text-2xl">
        <Flame size={20} />
        {stats.bestStreak}
      </div>
      <p className="text-sm text-gray-500">Best Streak</p>
    </div>
  </div>
);
