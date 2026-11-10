import { memo } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

interface Props {
  isActionTakenToday: boolean;
  onMarkComplete: () => void;
}

export const StreakMarkComplete = memo(({ isActionTakenToday, onMarkComplete }: Props) => (
  <div className="pb-8 sm:pb-10 pt-4">
    <motion.button
      className={`w-full h-[52px] sm:h-14 rounded-2xl text-[0.95rem] sm:text-base font-bold flex items-center justify-center gap-2.5 cursor-pointer transition-all duration-300 ${
        isActionTakenToday
          ? 'bg-brand text-on-brand shadow-[0_4px_20px_rgba(44,181,160,0.35)] cursor-not-allowed'
          : 'bg-ink text-on-brand hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.25)] active:translate-y-0'
      }`}
      onClick={onMarkComplete}
      whileTap={{ scale: isActionTakenToday ? 1 : 0.97 }}
      disabled={isActionTakenToday}
    >
      <Check size={20} strokeWidth={2.5} />
      {isActionTakenToday ? 'Completed today' : 'Mark today complete'}
    </motion.button>
  </div>
));

StreakMarkComplete.displayName = 'StreakMarkComplete';
