import { TrendingUp } from "lucide-react";
import type { DashboardTodayStats } from "../../store/statStore";

interface Props {
  today: DashboardTodayStats;
}

export const DashboardTodayCard = ({ today }: Props) => (
  <div className="mt-6 bg-white p-5 rounded-2xl shadow-sm">
    <div className="flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-500">Today</p>
        <h2 className="text-2xl font-bold text-gray-800">
          {today.completedHabits} / {today.totalHabits}
        </h2>
      </div>

      <div className="flex items-center gap-2 text-sf-teal font-semibold">
        <TrendingUp size={18} />
        {today.completionRate}%
      </div>
    </div>
  </div>
);
