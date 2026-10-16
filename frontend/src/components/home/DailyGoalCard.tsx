import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'

interface Props {
  completedCount: number;
  totalCount: number;
  percentage: number;
  longestStreak: number;
}

export const DailyGoalCard = ({ completedCount, totalCount, percentage, longestStreak }: Props) => {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - percentage / 100)

  return (
    <motion.div
      className="mt-5 sm:mt-6 bg-white rounded-2xl p-5 sm:p-6 flex items-center gap-5 sm:gap-6 shadow-[0_2px_16px_rgba(0,0,0,0.06)]"
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.15 }}
    >
      <div className="relative w-[120px] h-[120px] sm:w-[130px] sm:h-[130px] shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#e8f5f3" strokeWidth="10" />
          <motion.circle
            cx="60" cy="60" r={radius} fill="none" stroke="#2cb5a0" strokeWidth="10" strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[1.65rem] sm:text-[1.85rem] font-extrabold text-text-dark leading-none">
            {percentage}%
          </span>
          <span className="text-[0.7rem] text-text-dark-secondary mt-0.5">complete</span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <h2 className="text-[1.05rem] sm:text-lg font-bold text-text-dark">Daily Goal</h2>
        <p className="text-[0.82rem] sm:text-sm text-text-dark-secondary">
          {completedCount} of {totalCount} habits done today
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          <Flame size={15} className="text-orange-400" />
          <span className="text-[0.82rem] sm:text-sm font-semibold text-text-dark">
            {longestStreak} day streak
          </span>
        </div>
      </div>
    </motion.div>
  )
}
