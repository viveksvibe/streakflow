import { motion } from 'framer-motion'
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Habit } from '../../store/habitStore'

interface Props {
  habit?: Habit;
  totalHabits: number;
  onPrev: () => void;
  onNext: () => void;
}

export const StreakHeader = ({ habit, totalHabits, onPrev, onNext }: Props) => (
  <div
    className="relative rounded-b-[2rem] overflow-hidden pb-8 pt-8 sm:pt-10"
    style={{
      background: 'linear-gradient(160deg, #2cb5a0 0%, #4dc9b4 40%, #7dd8c8 100%)',
    }}
  >
    <div className="flex items-center justify-between max-w-sm mx-auto">
      {totalHabits > 1 ? (
        <button 
          onClick={onPrev}
          className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
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
        <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-2xl bg-white/25 backdrop-blur-md flex items-center justify-center text-3xl sm:text-[2rem] mb-3">
          {habit?.icon || '🎯'}
        </div>
        <h1 className="text-xl sm:text-[1.4rem] font-extrabold text-white tracking-tight">
          {habit?.name || 'My Habit'}
        </h1>
        <div className="flex items-center gap-1.5 mt-2">
          <Clock size={14} className="text-white/70" />
          <p className="text-[0.82rem] sm:text-sm text-white/75 font-medium">
            {habit?.reminderTime
              ? `Scheduled at ${habit.reminderTime}`
              : 'No schedule set'}
          </p>
        </div>
      </motion.div>

      {totalHabits > 1 ? (
        <button 
          onClick={onNext}
          className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        >
          <ChevronRight size={24} />
        </button>
      ) : <div className="w-10" />}
    </div>
  </div>
);
