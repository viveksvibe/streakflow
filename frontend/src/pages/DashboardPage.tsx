import { useEffect } from "react";
import { useStatStore } from "../store/statStore";
import Loader from "../components/Loader";
import { DashboardHeader } from "../components/dashboard/DashboardHeader";
import { DashboardTodayCard } from "../components/dashboard/DashboardTodayCard";
import { DashboardWeeklyChart } from "../components/dashboard/DashboardWeeklyChart";
import { DashboardStatsRow } from "../components/dashboard/DashboardStatsRow";
import { DashboardLeaderboard } from "../components/dashboard/DashboardLeaderboard";

const DashboardPage = () => {
  const { getDashboardStats, dashboardData } = useStatStore();

  useEffect(() => {
    getDashboardStats();
  }, [getDashboardStats]);

  if (!dashboardData) {
    return (
      <div className="min-h-[100dvh] flex flex-col bg-gradient-to-b from-[#e8faf6] to-white">
        <Loader variant="inline" message="Loading dashboard" />
      </div>
    );
  }

  const { user, today, stats } = dashboardData;

  return (
    <div className="min-h-[100dvh] flex flex-col pb-10 bg-gradient-to-b from-[#e8faf6] to-white">
      <div className="max-w-6xl mx-auto w-full px-5 sm:px-6 lg:px-8">
        <DashboardHeader user={user} />
        <DashboardTodayCard today={today} />
        <DashboardWeeklyChart dashboardData={dashboardData} />
        <DashboardStatsRow stats={stats} />
        {stats.leaderboard && <DashboardLeaderboard leaderboard={stats.leaderboard} />}
      </div>
    </div>
  );
};

export default DashboardPage;