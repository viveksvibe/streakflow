import { motion } from 'framer-motion'
import { Flame, Zap } from 'lucide-react'

const HabitCard = () => {
  const circumference = 2 * Math.PI * 32

  return (
    <motion.div
      className="bg-surface rounded-2xl p-5 w-full max-w-[320px] shadow-[var(--sf-card-shadow)] border border-line text-ink"
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.4, ease: 'easeOut' }}
    >
      {/* Header: habit info + streak badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-[10px] bg-brand/10 flex items-center justify-center text-brand">
            <Zap size={16} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-ink leading-tight">Morning Workout</h4>
            <p className="text-[0.72rem] text-ink-mid mt-0.5">Daily habit</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-brand/10 text-brand px-3 py-1.5 rounded-full text-[0.8rem] font-bold">
          <Flame size={12} />
          <span>28</span>
        </div>
      </div>

      {/* Body: stats + progress ring */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex flex-wrap items-baseline gap-1">
          <span className="text-[2rem] font-extrabold text-ink leading-none">28</span>
          <span className="text-sm text-ink-mid font-medium">days</span>
          <p className="w-full text-[0.72rem] text-ink-mid mt-0.5">Current streak</p>
        </div>

        <div className="relative w-[72px] h-[72px]">
          <svg className="w-full h-full" viewBox="0 0 80 80">
            <circle
              className="progress-ring-bg"
              cx="40" cy="40" r="32"
              fill="none" strokeWidth="6"
            />
            <motion.circle
              className="progress-ring-fill"
              cx="40" cy="40" r="32"
              fill="none" strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference * (1 - 0.78) }}
              transition={{ duration: 1.2, delay: 0.8, ease: 'easeOut' }}
              transform="rotate(-90 40 40)"
            />
          </svg>
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm font-bold text-brand">
            78%
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-2.5">
        <div className="flex-1 h-1.5 bg-well rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-sf-teal to-sf-teal-light rounded-full"
            initial={{ width: 0 }}
            animate={{ width: '71.4%' }}
            transition={{ duration: 1, delay: 1, ease: 'easeOut' }}
          />
        </div>
        <span className="text-xs text-ink-mid font-semibold">5/7</span>
      </div>
    </motion.div>
  )
}

export default HabitCard
