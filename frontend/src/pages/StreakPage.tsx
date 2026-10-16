import { useEffect, useState, useCallback } from 'react'
import { useStatStore } from '../store/statStore'
import { useHabitStore } from '../store/habitStore'
import Loader from '../components/Loader'
import { StreakHeader } from '../components/streak/StreakHeader'
import { StreakCurrentCard } from '../components/streak/StreakCurrentCard'
import { StreakActivityGrid } from '../components/streak/StreakActivityGrid'
import { StreakFreezeCard } from '../components/streak/StreakFreezeCard'
import { StreakMarkComplete } from '../components/streak/StreakMarkComplete'

const StreakPage = () => {
  const { dashboardData, getDashboardStats } = useStatStore();
  const { freezeHabit, completeHabit, isLoading } = useHabitStore();

  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    getDashboardStats();
  }, [getDashboardStats]);

  const habitsList = dashboardData?.habits || [];
  const habit = habitsList[selectedIndex] || null;

  const handleNext = () => {
    if (habitsList.length > 0) {
      setSelectedIndex((prev) => (prev + 1) % habitsList.length);
    }
  };

  const handlePrev = () => {
    if (habitsList.length > 0) {
      setSelectedIndex((prev) => (prev - 1 + habitsList.length) % habitsList.length);
    }
  };
  
  const freezesLeft = dashboardData?.streakFreeze?.monthlyCredits ?? 0;
  
  const heatmap = dashboardData?.stats?.activityHeatmap;
  const todayStatus = habit?.frozenToday ? 'frozen' : habit?.completedToday ? 'completed' : 'missed';
  
  // This habit is considered acted on if it was explicitly completed today or if the day was frozen
  const isActionTakenToday = Boolean(habit?.completedToday || habit?.frozenToday);

  const handleMarkComplete = useCallback(async () => {
    if (habit) {
      try {
        await completeHabit(habit.id);
        await getDashboardStats();
      } catch (error) {
        console.error(error);
      }
    }
  }, [habit, completeHabit, getDashboardStats]);

  const handleUseFreeze = useCallback(async () => {
    if (freezesLeft > 0 && habit) {
      try {
        await freezeHabit(habit.id);
        await getDashboardStats();
      } catch (error) {
        console.error(error);
      }
    }
  }, [freezesLeft, habit, freezeHabit, getDashboardStats]);

  if (!dashboardData) {
    return (
      <div className="min-h-[100dvh] flex flex-col bg-gradient-to-b from-[#e8faf6] to-white">
        <Loader variant="inline" message="Loading streak" />
      </div>
    );
  }

  return (
    <div
      className="min-h-[100dvh] flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #e8faf6 0%, #f0fdf9 30%, #f7fdfb 60%, #ffffff 100%)',
      }}
    >
      <div className="max-w-6xl mx-auto w-full px-5 sm:px-6 lg:px-8 flex-1 flex flex-col">
        <StreakHeader 
          habit={habit} 
          totalHabits={habitsList.length}
          onNext={handleNext}
          onPrev={handlePrev}
        />
        
        <StreakCurrentCard 
          currentStreak={habit?.currentStreak || 0}
          bestStreak={habit?.bestStreak || 0}
        />

        <StreakActivityGrid 
          heatmap={heatmap || []}
          markedToday={habit?.completedToday || false}
        />

        <StreakFreezeCard 
          freezesLeft={freezesLeft}
          isLoading={isLoading}
          isActionTakenToday={isActionTakenToday}
          todayStatus={todayStatus}
          markedToday={habit?.completedToday || false}
          onUseFreeze={handleUseFreeze}
        />

        <div className="flex-1 min-h-6" />

        <StreakMarkComplete 
          isActionTakenToday={isActionTakenToday}
          onMarkComplete={handleMarkComplete}
        />
      </div>
    </div>
  )
}

export default StreakPage
