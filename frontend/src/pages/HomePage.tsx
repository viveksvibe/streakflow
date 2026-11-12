import { useEffect, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useHabitStore, type Habit } from '../store/habitStore'
import { HomeHeader } from '../components/home/HomeHeader'
import { DailyGoalCard } from '../components/home/DailyGoalCard'
import { HabitItem } from '../components/home/HabitItem'
import { AddHabitModal } from '../components/home/AddHabitModal'
import { EditHabitModal } from '../components/home/EditHabitModal'
import { DeleteHabitModal } from '../components/home/DeleteHabitModal'
import Loader from '../components/common/Loader'

const HomePage = () => {
  const { habits, getHabits, isLoading } = useHabitStore()
  const [isInitialLoad, setIsInitialLoad] = useState(habits.length === 0);

  useEffect(() => {
    const fetchHabits = async () => {
      await getHabits();
      setIsInitialLoad(false);
    };
    fetchHabits();
  }, [getHabits])

  const [showAddModal, setShowAddModal] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [deletingHabit, setDeletingHabit] = useState<Habit | null>(null)
  const [exitingHabitId, setExitingHabitId] = useState<string | null>(null)

  // Memoized modal handlers — stable references so child components don't re-render
  const openAddModal = useCallback(() => setShowAddModal(true), [])
  const closeAddModal = useCallback(() => setShowAddModal(false), [])
  const closeEditModal = useCallback(() => setEditingHabit(null), [])
  const closeDeleteModal = useCallback(() => setDeletingHabit(null), [])

  // Derived stats — recomputed only when habits array changes
  const { completedCount, totalCount, percentage, longestStreak } = useMemo(() => {
    const completed = (habits ?? []).filter((h) => h.completedToday).length
    const total = habits?.length || 0
    return {
      completedCount: completed,
      totalCount: total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      longestStreak: habits?.reduce((max, h) => Math.max(max, h.bestStreak), 0) || 0,
    }
  }, [habits])

  if (isInitialLoad && isLoading) {
    return (
      <div className="min-h-[100dvh] flex flex-col bg-page">
        <Loader variant="inline" message="Loading your habits" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-page">
      <div className="max-w-6xl mx-auto w-full px-5 sm:px-6 lg:px-8 flex-1 flex flex-col">
        <HomeHeader />

        <DailyGoalCard
          completedCount={completedCount}
          totalCount={totalCount}
          percentage={percentage}
          longestStreak={longestStreak}
        />

        <div className="mt-7 sm:mt-8 mb-3 flex items-center justify-between">
          <h3 className="text-[1rem] sm:text-[1.1rem] font-bold text-ink">Today's Habits</h3>
          <span className="text-[0.78rem] sm:text-[0.82rem] text-ink-mute font-medium">
            {completedCount}/{totalCount} done
          </span>
        </div>

        <div className="flex-1 pb-24 flex flex-col gap-3">
          <AnimatePresence mode="popLayout">
            {habits.map((habit) => (
              <HabitItem
                key={habit.id}
                habit={habit}
                exiting={habit.id === exitingHabitId}
                onEdit={setEditingHabit}
                onDelete={setDeletingHabit}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      <motion.button
        className="fixed bottom-6 right-5 sm:right-6 h-11 px-4.5 bg-brand text-on-brand rounded-full text-[0.88rem] font-semibold flex items-center gap-2 shadow-[0_4px_20px_rgba(26,138,125,0.35)] cursor-pointer z-30 hover:shadow-[0_6px_28px_rgba(26,138,125,0.45)] active:scale-95 transition-shadow duration-300"
        onClick={openAddModal}
        whileTap={{ scale: 0.93 }}
      >
        <Plus size={17} strokeWidth={2.5} />
        Add Habit
      </motion.button>

      <AddHabitModal isOpen={showAddModal} onClose={closeAddModal} />
      <EditHabitModal habit={editingHabit} onClose={closeEditModal} />
      <DeleteHabitModal
        habit={deletingHabit}
        onClose={closeDeleteModal}
        onConfirmStart={setExitingHabitId}
      />
    </div>
  )
}

export default HomePage
