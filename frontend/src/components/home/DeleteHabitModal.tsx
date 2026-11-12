import { useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, AlertTriangle, Flame } from 'lucide-react'
import { useHabitStore, type Habit } from '../../store/habitStore'

interface Props {
  habit: Habit | null;
  onClose: () => void;
  /** Called the instant the user confirms, so the card can animate out. */
  onConfirmStart?: (habitId: string) => void;
}

export const DeleteHabitModal = memo(({ habit, onClose, onConfirmStart }: Props) => {
  const { deleteHabit } = useHabitStore()

  const handleDelete = useCallback(() => {
    if (!habit) return
    onConfirmStart?.(habit.id)
    onClose()
    void deleteHabit(habit.id)
  }, [habit, onConfirmStart, onClose, deleteHabit])

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
              className="w-full max-w-sm bg-surface rounded-3xl p-7 sm:p-9 shadow-[var(--sf-card-shadow)] border border-line pointer-events-auto text-center"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <motion.div
                className="w-14 h-14 mx-auto rounded-full bg-danger-soft flex items-center justify-center mb-5"
                initial={{ scale: 0.5 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
              >
                <AlertTriangle size={26} className="text-danger-text" />
              </motion.div>

              <h3 className="text-[1.1rem] font-bold text-ink mb-2">Delete Habit?</h3>
              <p className="text-[0.8rem] text-ink-mute leading-relaxed mb-1">
                Are you sure you want to delete
              </p>
              <p className="text-[0.88rem] font-semibold text-ink mb-1">
                {habit.icon} {habit.name}
              </p>
              {habit.bestStreak > 0 && (
                <p className="text-[0.75rem] text-danger-text font-medium flex items-center justify-center gap-1 mt-2">
                  <Flame size={12} />
                  You'll lose your {habit.bestStreak}-day streak record
                </p>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  className="flex-1 h-11 rounded-xl border border-line text-ink-mid text-[0.88rem] font-semibold cursor-pointer hover:bg-well transition-colors duration-200"
                  onClick={onClose}
                >
                  Keep It
                </button>
                <motion.button
                  className="flex-1 h-11 bg-danger text-on-brand rounded-xl text-[0.88rem] font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(220,38,38,0.35)] active:translate-y-0"
                  onClick={handleDelete}
                  whileTap={{ scale: 0.97 }}
                >
                  <Trash2 size={15} strokeWidth={2.5} />
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
})

DeleteHabitModal.displayName = 'DeleteHabitModal'
