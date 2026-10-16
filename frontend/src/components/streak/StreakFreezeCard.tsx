import { motion } from 'framer-motion'
import { Snowflake } from 'lucide-react'

interface Props {
  freezesLeft: number;
  isLoading: boolean;
  isActionTakenToday: boolean;
  todayStatus: string | undefined;
  markedToday: boolean;
  onUseFreeze: () => void;
}

export const StreakFreezeCard = ({ 
  freezesLeft, isLoading, isActionTakenToday, todayStatus, markedToday, onUseFreeze 
}: Props) => (
  <motion.div
    className="mt-4 sm:mt-5 bg-white rounded-2xl p-4 sm:p-5 shadow-[0_2px_16px_rgba(0,0,0,0.06)] flex items-center gap-3.5"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.4 }}
  >
    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#e8f4fd] flex items-center justify-center shrink-0">
      <Snowflake size={22} className="text-blue-400" />
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="text-[0.9rem] sm:text-[0.95rem] font-bold text-text-dark">
        Streak Freeze
      </h4>
      <p className="text-[0.75rem] sm:text-[0.78rem] text-text-dark-secondary mt-0.5">
        {freezesLeft} freezes left this month
      </p>
    </div>
    <button
      className={`px-4 py-2 rounded-xl text-[0.82rem] sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
        freezesLeft > 0 && !isLoading && !isActionTakenToday
          ? 'text-sf-teal bg-[#e6f9f4] hover:bg-[#d4f3ec] active:scale-95'
          : 'text-gray-400 bg-gray-100 cursor-not-allowed'
      }`}
      onClick={onUseFreeze}
      disabled={freezesLeft === 0 || isLoading || isActionTakenToday}
    >
      {isLoading 
        ? 'Wait...' 
        : todayStatus === 'frozen' 
          ? 'Used' 
          : todayStatus === 'completed' || markedToday 
            ? 'Done' 
            : 'Use'}
    </button>
  </motion.div>
);
