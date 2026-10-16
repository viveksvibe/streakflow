import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, AlertTriangle, Flame } from 'lucide-react'
import { useHabitStore, type Habit } from '../../store/habitStore'

interface Props {
  habit: Habit | null;
  onClose: () => void;
}

export const DeleteHabitModal = ({ habit, onClose }: Props) => {
  const { deleteHabit } = useHabitStore()

  const handleDelete = async () => {
    if (!habit) return
    await deleteHabit(habit.id)
    onClose()
  }

  return (
    <AnimatePresence>
      {habit && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center px-6 sm:px-8 pointer-events-none">
            <motion.div
              className="w-full max-w-sm bg-white rounded-3xl p-7 sm:p-9 shadow-[0_16px_60px_rgba(0,0,0,0.18)] pointer-events-auto text-center"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <motion.div
                className="w-16 h-16 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-5"
                initial={{ scale: 0.5 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
              >
                <AlertTriangle size={28} className="text-red-400" />
              </motion.div>

              <h3 className="text-lg font-bold text-text-dark mb-2">Delete Habit?</h3>
              <p className="text-[0.85rem] text-text-dark-secondary leading-relaxed mb-1">
                Are you sure you want to delete
              </p>
              <p className="text-[0.92rem] font-semibold text-text-dark mb-1">
                {habit.icon} {habit.name}
              </p>
              {habit.bestStreak > 0 && (
                <p className="text-[0.78rem] text-red-400 font-medium flex items-center justify-center gap-1 mt-2">
                  <Flame size={13} />
                  You'll lose your {habit.bestStreak}-day streak record
                </p>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  className="flex-1 h-12 rounded-xl border border-gray-200 text-text-dark-secondary text-[0.92rem] font-semibold cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                  onClick={onClose}
                >
                  Keep It
                </button>
                <motion.button
                  className="flex-1 h-12 bg-gradient-to-r from-red-400 to-red-500 text-white rounded-xl text-[0.92rem] font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(239,68,68,0.35)] active:translate-y-0"
                  onClick={handleDelete}
                  whileTap={{ scale: 0.97 }}
                >
                  <Trash2 size={16} strokeWidth={2.5} />
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
