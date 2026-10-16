import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useHabitStore, type Habit } from '../store/habitStore'
import { HomeHeader } from '../components/home/HomeHeader'
import { DailyGoalCard } from '../components/home/DailyGoalCard'
import { HabitItem } from '../components/home/HabitItem'
import { AddHabitModal } from '../components/home/AddHabitModal'
import { EditHabitModal } from '../components/home/EditHabitModal'
import { DeleteHabitModal } from '../components/home/DeleteHabitModal'
import Loader from '../components/Loader'

const HomePage = () => {
  const { habits, getHabits, isLoading } = useHabitStore()
  const [isInitialLoad, setIsInitialLoad] = useState(habits.length === 0);

  useEffect(() => {
    const fetchHabits = async () => {
      await getHabits();
      setIsInitialLoad(false);
    };
    fetchHabits();
  }, [])

  const [showAddModal, setShowAddModal] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [deletingHabit, setDeletingHabit] = useState<Habit | null>(null)

  const completedCount = (habits ?? []).filter((h) => h.completedToday).length
  const totalCount = habits?.length || 0
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const longestStreak = habits?.reduce((max, h) => Math.max(max, h.bestStreak), 0) || 0
  
  if (isInitialLoad && isLoading) {
    return (
      <div className="min-h-[100dvh] flex flex-col bg-gradient-to-b from-[#e8faf6] to-white">
        <Loader variant="inline" message="Loading your habits" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ background: 'linear-gradient(180deg, #e8faf6 0%, #f0fdf9 30%, #f7fdfb 60%, #ffffff 100%)' }}>
      <div className="max-w-6xl mx-auto w-full px-5 sm:px-6 lg:px-8 flex-1 flex flex-col">
        <HomeHeader />

        <DailyGoalCard 
          completedCount={completedCount}
          totalCount={totalCount}
          percentage={percentage}
          longestStreak={longestStreak}
        />

        <motion.div
          className="mt-7 sm:mt-8 mb-3 flex items-center justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <h3 className="text-[1.1rem] sm:text-lg font-bold text-text-dark">Today's Habits</h3>
          <span className="text-[0.82rem] sm:text-sm text-text-dark-secondary font-medium">
            {completedCount}/{totalCount} done
          </span>
        </motion.div>

        <div className="flex-1 pb-24 flex flex-col gap-3">
          <AnimatePresence>
            {habits.map((habit, index) => (
              <HabitItem
                key={habit.id}
                habit={habit}
                index={index}
                onEdit={setEditingHabit}
                onDelete={setDeletingHabit}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      <motion.button
        className="fixed bottom-6 right-5 sm:right-6 h-12 px-5 bg-surface-dark text-white rounded-full text-sm font-semibold flex items-center gap-2 shadow-[0_4px_20px_rgba(0,0,0,0.25)] cursor-pointer z-30 hover:shadow-[0_6px_28px_rgba(0,0,0,0.35)] active:scale-95 transition-shadow duration-300"
        onClick={() => setShowAddModal(true)}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
        whileTap={{ scale: 0.93 }}
      >
        <Plus size={18} strokeWidth={2.5} />
        Add Habit
      </motion.button>

      <AddHabitModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
      <EditHabitModal habit={editingHabit} onClose={() => setEditingHabit(null)} />
      <DeleteHabitModal habit={deletingHabit} onClose={() => setDeletingHabit(null)} />
    </div>
  )
}

export default HomePage
