import { memo } from 'react'
import { motion } from 'framer-motion'
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Habit } from '../../store/habitStore'

interface Props {
  habit?: Habit;
  totalHabits: number;
  onPrev: () => void;
  onNext: () => void;
}

export const StreakHeader = memo(({ habit, totalHabits, onPrev, onNext }: Props) => (
  <div
    className="relative rounded-b-[2rem] overflow-hidden pb-8 pt-8 sm:pt-10 bg-brand"
  >
    <div className="flex items-center justify-between max-w-sm mx-auto">
      {totalHabits > 1 ? (
        <button
          onClick={onPrev}
          className="w-10 h-10 rounded-full bg-ink/10 flex items-center justify-center text-on-brand hover:bg-ink/20 transition-colors cursor-pointer"
        >
          <ChevronLeft size={24} />
        </button>
      ) : <div className="w-10" />}

      <motion.div
        key={habit?.id}
        className="flex flex-col items-center text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-2xl bg-ink/10 flex items-center justify-center text-3xl sm:text-[2rem] mb-3">
          {habit?.icon || '🎯'}
        </div>
        <h1 className="text-xl sm:text-[1.4rem] font-display font-bold text-on-brand tracking-tight">
          {habit?.name || 'My Habit'}
        </h1>
        <div className="flex items-center gap-1.5 mt-2">
          <Clock size={14} className="text-on-brand/70" />
          <p className="text-[0.82rem] sm:text-sm text-on-brand/75 font-medium">
            {habit?.reminderTime
              ? `Scheduled at ${habit.reminderTime}`
              : 'No schedule set'}
          </p>
        </div>
      </motion.div>

      {totalHabits > 1 ? (
        <button
          onClick={onNext}
          className="w-10 h-10 rounded-full bg-ink/10 flex items-center justify-center text-on-brand hover:bg-ink/20 transition-colors cursor-pointer"
        >
          <ChevronRight size={24} />
        </button>
      ) : <div className="w-10" />}
    </div>
  </div>
));

StreakHeader.displayName = 'StreakHeader';
