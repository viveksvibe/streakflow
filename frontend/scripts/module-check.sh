#!/usr/bin/env bash
# Checks that every critical frontend module transforms cleanly through Vite.
MODULES=(
  /src/App.tsx
  /src/main.tsx
  /src/hooks/useAppHydration.ts
  /src/hooks/useHabitReminders.ts
  /src/hooks/useNavigator.ts
  /src/store/authStore.ts
  /src/store/habitStore.ts
  /src/store/statStore.ts
  /src/routes/ProtectedRoutes.tsx
  /src/routes/PublicRoutes.tsx
  /src/api/index.ts
  /src/api/habit.ts
  /src/api/auth.ts
  /src/api/stats.ts
  /src/utils/error.ts
  /src/constant.ts
  /src/components/ErrorBoundary.tsx
  /src/components/common/Navbar.tsx
  /src/components/common/Loader.tsx
  /src/components/common/Logo.tsx
  /src/components/common/HabitCard.tsx
  /src/components/common/CustomTimePicker.tsx
  /src/components/home/HomeHeader.tsx
  /src/components/home/DailyGoalCard.tsx
  /src/components/home/HabitItem.tsx
  /src/components/home/AddHabitModal.tsx
  /src/components/home/EditHabitModal.tsx
  /src/components/home/DeleteHabitModal.tsx
  /src/components/dashboard/DashboardHeader.tsx
  /src/components/dashboard/DashboardTodayCard.tsx
  /src/components/dashboard/DashboardWeeklyChart.tsx
  /src/components/dashboard/DashboardStatsRow.tsx
  /src/components/dashboard/DashboardLeaderboard.tsx
  /src/components/streak/StreakHeader.tsx
  /src/components/streak/StreakCurrentCard.tsx
  /src/components/streak/StreakActivityGrid.tsx
  /src/components/streak/StreakFreezeCard.tsx
  /src/components/streak/StreakMarkComplete.tsx
  /src/pages/HomePage.tsx
  /src/pages/DashboardPage.tsx
  /src/pages/StreakPage.tsx
  /src/pages/ProfilePage.tsx
  /src/pages/SignInPage.tsx
  /src/pages/SignUpPage.tsx
  /src/pages/WelcomePage.tsx
)

FAILURES=0
for m in "${MODULES[@]}"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:5173$m")
  if [ "$code" != "200" ]; then
    echo "FAIL $code $m"
    FAILURES=$((FAILURES + 1))
  fi
done

if [ "$FAILURES" -eq 0 ]; then
  echo "ALL ${#MODULES[@]} MODULES TRANSFORM OK"
else
  echo "MODULE FAILURES: $FAILURES"
fi
