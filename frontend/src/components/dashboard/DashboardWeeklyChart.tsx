import { useMemo } from "react";
import { motion } from "framer-motion";
import type { DashboardResponse } from "../../store/statStore";

interface Props {
  dashboardData: DashboardResponse;
}

export const DashboardWeeklyChart = ({ dashboardData }: Props) => {
  const maxBar = useMemo(() => {
    return Math.max(
      ...dashboardData.stats.weeklyProgress.map((d) => d.completedHabits),
      1
    );
  }, [dashboardData]);

  const renderedChart = useMemo(() => {
    return dashboardData.stats.weeklyProgress.map((day, i) => {
      const height = (day.completedHabits / maxBar) * 100;
      const isToday = day.date === dashboardData.today.localDate;

      return (
        <div key={day.date} className="flex-1 flex flex-col items-center justify-end h-full">
          <motion.div
            className={`w-full rounded-lg ${
              isToday ? "bg-sf-teal" : "bg-sf-teal/20"
            }`}
            style={{ minHeight: "6px" }}
            initial={{ height: 0 }}
            animate={{ height: `${height}%` }}
            transition={{ duration: 0.6, delay: i * 0.05 }}
          />

          <span className="text-[10px] mt-1 text-gray-500">
            {new Date(day.date + 'T00:00:00').toLocaleDateString("en-US", {
              weekday: "short",
            })}
          </span>
        </div>
      );
    });
  }, [dashboardData, maxBar]);

  return (
    <div className="mt-6 bg-white p-5 rounded-2xl shadow-sm">
      <h3 className="font-semibold mb-4">Weekly Progress</h3>
      <div className="flex items-end gap-2 h-[140px]">
        {renderedChart}
      </div>
    </div>
  );
};
