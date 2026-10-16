import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

interface Props {
  isActionTakenToday: boolean;
  onMarkComplete: () => void;
}

export const StreakMarkComplete = ({ isActionTakenToday, onMarkComplete }: Props) => (
  <motion.div
    className="pb-8 sm:pb-10 pt-4"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
  >
    <motion.button
      className={`w-full h-[52px] sm:h-14 rounded-2xl text-[0.95rem] sm:text-base font-bold flex items-center justify-center gap-2.5 cursor-pointer transition-all duration-300 ${
        isActionTakenToday
          ? 'bg-sf-teal text-white shadow-[0_4px_20px_rgba(44,181,160,0.35)] cursor-not-allowed'
          : 'bg-surface-dark text-white hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.3)] active:translate-y-0'
      }`}
      onClick={onMarkComplete}
      whileTap={{ scale: isActionTakenToday ? 1 : 0.97 }}
      disabled={isActionTakenToday}
    >
      <Check size={20} strokeWidth={2.5} />
      {isActionTakenToday ? 'Completed Today! 🎉' : 'Mark Today Complete'}
    </motion.button>
  </motion.div>
);
