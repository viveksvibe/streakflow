import { motion } from 'framer-motion'
import { Check, Flame, Pencil, Trash2 } from 'lucide-react'
import { useHabitStore, type Habit } from '../../store/habitStore'

interface Props {
  habit: Habit;
  index: number;
  onEdit: (habit: Habit) => void;
  onDelete: (habit: Habit) => void;
}

export const HabitItem = ({ habit, index, onEdit, onDelete }: Props) => {
  const { completeHabit } = useHabitStore()

  return (
    <motion.div
      className={`group relative flex items-center gap-3.5 sm:gap-4 p-3.5 sm:p-4 rounded-2xl transition-all duration-300 ${
        habit.completedToday
          ? 'bg-[#e6f9f4] shadow-[0_1px_8px_rgba(44,181,160,0.12)]'
          : 'bg-white shadow-[0_1px_8px_rgba(0,0,0,0.05)]'
      }`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.4, delay: 0.1 * index + 0.4 }}
      layout
    >
      <div
        className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl shrink-0 cursor-pointer ${
          habit.completedToday ? 'bg-[#d0f0e8]' : 'bg-[#f0f7f5]'
        }`}
        onClick={() => completeHabit(habit.id)}
      >
        {habit.icon}
      </div>

      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => completeHabit(habit.id)}>
        <h4 className={`text-[0.92rem] sm:text-[0.95rem] font-semibold leading-tight ${
          habit.completedToday ? 'text-text-dark/60 line-through' : 'text-text-dark'
        }`}>
          {habit.name}
        </h4>
        <div className="flex items-center gap-1 mt-1">
          <Flame size={12} className="text-orange-400" />
          <span className="text-[0.75rem] sm:text-[0.78rem] text-sf-teal font-semibold">
            {habit.bestStreak} days
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 shrink-0">
        <motion.button
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-sf-teal/10 flex items-center justify-center text-sf-teal hover:bg-sf-teal/20 cursor-pointer transition-colors duration-200"
          onClick={(e) => { e.stopPropagation(); onEdit(habit); }}
          whileTap={{ scale: 0.9 }}
          title="Edit habit"
        >
          <Pencil size={14} strokeWidth={2.2} />
        </motion.button>
        <motion.button
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 hover:text-red-500 cursor-pointer transition-colors duration-200"
          onClick={(e) => { e.stopPropagation(); onDelete(habit); }}
          whileTap={{ scale: 0.9 }}
          title="Delete habit"
        >
          <Trash2 size={14} strokeWidth={2.2} />
        </motion.button>
      </div>

      <div
        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300 cursor-pointer ${
          habit.completedToday ? 'bg-sf-teal border-sf-teal' : 'border-gray-200 bg-white hover:border-sf-teal/40'
        }`}
        onClick={() => completeHabit(habit.id)}
      >
        {habit.completedToday && <Check size={16} className="text-white" strokeWidth={3} />}
      </div>
    </motion.div>
  )
}
