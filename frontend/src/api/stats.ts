
// http://13.60.170.161/api/v1/stats/dashboard
// http://localhost:3000/api/v1/stats/weekly-progress
// http://localhost:3000/api/v1/stats/activity-heatmap
// http://localhost:3000/api/v1/stats/habit-leaderboard

import apiClient from ".";


export const getDashboardStatsApi = async () => {
    return apiClient.get("/stats/dashboard");
}

export const getWeeklyProgressApi = async () => {
    return apiClient.get("/stats/weekly-progress");
}  

export const getActivityHeatmapApi = async () => {
    return apiClient.get("/stats/activity-heatmap");
}

export const getHabitLeaderboardApi = async () => {
    return apiClient.get("/stats/habit-leaderboard");
}