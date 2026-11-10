import { memo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Check, Flame, Pencil, Trash2 } from 'lucide-react'
import { useHabitStore, type Habit } from '../../store/habitStore'

interface Props {
  habit: Habit;
  /** True while this item is playing its confirmed-delete exit. */
  exiting?: boolean;
  onEdit: (habit: Habit) => void;
  onDelete: (habit: Habit) => void;
}

export const HabitItem = memo(({ habit, exiting = false, onEdit, onDelete }: Props) => {
  const completeHabit = useHabitStore((state) => state.completeHabit)

  const handleComplete = useCallback(() => {
    completeHabit(habit.id)
  }, [completeHabit, habit.id])

  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit(habit)
  }, [onEdit, habit])

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(habit)
  }, [onDelete, habit])

  // AUDIT FIX [5.2 & 5.3]: Keyboard accessibility and screen reader support for habit item
  return (
    <motion.div
      className={`group relative flex items-center gap-3.5 sm:gap-4 p-3.5 sm:p-4 rounded-2xl transition-colors duration-300 ${
        habit.completedToday
          ? 'bg-done-bg shadow-[0_1px_8px_rgba(44,181,160,0.12)]'
          : 'bg-surface shadow-[0_1px_8px_rgba(0,0,0,0.05)]'
      }`}
      layout
      initial={false}
      animate={{ opacity: 1 }}
      exit={{
        opacity: 0,
        scale: 0.96,
        transition: exiting
          ? { duration: 0.22, ease: 'easeIn' }
          : { duration: 0 },
      }}
    >
      <button
        type="button"
        className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl shrink-0 cursor-pointer transition-transform hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
          habit.completedToday ? 'bg-done-bg' : 'bg-well'
        }`}
        onClick={handleComplete}
        aria-label={habit.completedToday ? `Mark ${habit.name} incomplete` : `Mark ${habit.name} complete`}
      >
        {habit.icon}
      </button>

      <button
        type="button"
        className="flex-1 min-w-0 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-lg p-0.5"
        onClick={handleComplete}
        aria-label={habit.completedToday ? `${habit.name}, completed today. Click to toggle.` : `${habit.name}. Click to complete.`}
      >
        <h4 className={`text-[0.92rem] sm:text-[0.95rem] font-semibold leading-tight ${
          habit.completedToday ? 'text-ink/60 line-through' : 'text-ink'
        }`}>
          {habit.name}
        </h4>
        <div className="flex items-center gap-1 mt-1">
          <Flame size={12} className="text-ember" />
          <span className="text-[0.75rem] sm:text-[0.78rem] text-brand font-semibold">
            {habit.bestStreak} days
          </span>
        </div>
      </button>

      <div className="flex items-center gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 shrink-0">
        <motion.button
          type="button"
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-brand/10 flex items-center justify-center text-brand hover:bg-brand/20 cursor-pointer transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          onClick={handleEdit}
          whileTap={{ scale: 0.9 }}
          title="Edit habit"
          aria-label={`Edit ${habit.name}`}
        >
          <Pencil size={14} strokeWidth={2.2} />
        </motion.button>
        <motion.button
          type="button"
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-danger-soft flex items-center justify-center text-danger-text hover:bg-danger-line hover:text-danger cursor-pointer transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-danger"
          onClick={handleDelete}
          whileTap={{ scale: 0.9 }}
          title="Delete habit"
          aria-label={`Delete ${habit.name}`}
        >
          <Trash2 size={14} strokeWidth={2.2} />
        </motion.button>
      </div>

      <button
        type="button"
        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
          habit.completedToday ? 'bg-brand border-brand' : 'border-line bg-surface hover:border-brand/40'
        }`}
        onClick={handleComplete}
        aria-label={habit.completedToday ? `Mark ${habit.name} incomplete` : `Mark ${habit.name} complete`}
        aria-pressed={habit.completedToday}
      >
        {habit.completedToday && <Check size={16} className="text-on-brand" strokeWidth={3} />}
      </button>
    </motion.div>
  )
})

HabitItem.displayName = 'HabitItem'
