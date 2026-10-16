import { create } from "zustand";
import type { Habit } from "./habitStore";
import { getDashboardStatsApi } from "../api/stats";
import toast from "react-hot-toast";
import { getErrorMessage, getErrorStatus } from "../utils/error";


export interface DashboardUser {
  id: string;
  fullName: string;
  timezone: string;
}

export interface DashboardTodayStats {
  localDate: string;
  completedHabits: number;
  totalHabits: number;
  completionRate: number;
}

export interface StreakFreeze {
  monthlyCredits: number;
}
export interface DashboardWeeklyProgress {
    date: string;
    completedHabits: number;
}

export interface DashboardActivityHeatmap {
  date: string;
  completions: number;
  status: "completed" | "missed" | "partial" | "frozen";
}



export interface LeaderboardItem {
  habitId: string;
  name: string;
  icon: string;
  currentStreak: number;
  bestStreak: number;
}

export interface Stats {
  totalCompletions: number;
  bestStreak: number;
  weeklyProgress: DashboardWeeklyProgress[];
  activityHeatmap: DashboardActivityHeatmap[];
  leaderboard: LeaderboardItem[];
}

export interface DashboardResponse {
  user: DashboardUser;
  today:DashboardTodayStats;
  habits: Habit[];
  streakFreeze: StreakFreeze;
  stats: Stats;
}


interface StatState {
    dashboardData: DashboardResponse | null;
    getDashboardStats: () => Promise<void>;
    isLoading: boolean;
    error: string | null;


}

export const useStatStore = create<StatState>((set, get) => ({
    dashboardData: null,
    isLoading: false,
    error: null,

    getDashboardStats: async () => {
        if (!localStorage.getItem("accessToken")) return;
        if (get().isLoading) return;
        set({ isLoading: true, error: null });
        try{
            const {data} = await getDashboardStatsApi();
            if(!data.success) {
                throw new Error(data.message || "Failed to fetch dashboard stats");
            }
            set({ dashboardData: data.data, isLoading: false });
        }catch(error) {
            const errorMsg = getErrorMessage(error, "Failed to fetch dashboard stats");
            set({ error: errorMsg, isLoading: false });
            if (getErrorStatus(error) !== 401) {
                toast.error(errorMsg);
            }
        }
    },


}));