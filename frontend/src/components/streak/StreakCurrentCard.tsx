import { motion } from 'framer-motion'
import { Flame, Trophy } from 'lucide-react'

interface Props {
  currentStreak: number;
  bestStreak: number;
}

export const StreakCurrentCard = ({ currentStreak, bestStreak }: Props) => (
  <motion.div
    className="-mt-5 bg-white rounded-2xl p-5 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.08)] flex flex-col items-center text-center relative z-10"
    initial={{ opacity: 0, y: 25, scale: 0.96 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.6, delay: 0.2 }}
  >
    <span className="text-[0.68rem] sm:text-[0.72rem] font-bold tracking-[0.15em] text-text-dark-secondary uppercase mb-2">
      Current Streak
    </span>

    <div className="flex items-center gap-1.5 mb-0.5">
      <Flame size={22} className="text-orange-400" />
      <span className="text-[2rem] sm:text-[2.2rem] font-extrabold text-text-dark leading-none">
        {currentStreak}
      </span>
    </div>
    <span className="text-[0.8rem] sm:text-[0.85rem] text-text-dark-secondary font-semibold mb-2">
      Day Streak
    </span>

    <div className="flex items-center gap-1.5 bg-[#fef9e7] px-3 py-1 rounded-full">
      <Trophy size={12} className="text-amber-500" />
      <span className="text-[0.75rem] sm:text-[0.78rem] font-bold text-amber-600">
        Best: {bestStreak} days
      </span>
    </div>
  </motion.div>
);
