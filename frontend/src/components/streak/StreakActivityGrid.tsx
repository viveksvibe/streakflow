import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Calendar } from 'lucide-react'
import type { DashboardActivityHeatmap } from '../../store/statStore'

interface Props {
  heatmap?: DashboardActivityHeatmap[];
  markedToday: boolean;
}

export const StreakActivityGrid = ({ heatmap, markedToday }: Props) => {
  const renderedHeatmap = useMemo(() => {
    if (!heatmap || heatmap.length === 0) return null;

    const firstDate = new Date(heatmap[0].date + 'T00:00:00');
    const startDay = (firstDate.getDay() + 6) % 7; 
    
    const blanks = Array.from({ length: startDay }).map((_, i) => (
      <div key={`blank-${i}`} className="w-[32px] h-[32px] sm:w-[34px] sm:h-[34px]" />
    ));

    const days = heatmap.map((day, i) => {
      const isToday = i === heatmap.length - 1;
      let bg = '';
      let border = '';
      
      if (markedToday && isToday) {
        bg = 'bg-sf-teal';
      } else if (day.status === 'completed') {
        bg = 'bg-sf-teal';
      } else if (day.status === 'frozen') {
        bg = 'bg-blue-400';
      } else if (day.status === 'missed') {
        bg = 'bg-sf-coral/40';
      } else {
        bg = 'bg-[#e0f5f0]';
        border = 'border-[1.5px] border-dashed border-sf-teal/40';
      }

      return (
        <motion.div
          key={`day-${i}`}
          className={`flex items-center justify-center w-[32px] h-[32px] sm:w-[34px] sm:h-[34px] rounded-md sm:rounded-lg ${bg} ${border} transition-all duration-200`}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25, delay: 0.35 + i * 0.012 }}
        >
          <span className={`text-[10px] font-medium ${bg === 'bg-sf-teal' || bg === 'bg-blue-400' ? 'text-white/95' : 'text-gray-600'}`}>
            {new Date(day.date + 'T00:00:00').getDate()}
          </span>
        </motion.div>
      )
    });

    return [...blanks, ...days];
  }, [heatmap, markedToday]);

  return (
    <motion.div
      className="mt-6 sm:mt-7"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-[1.05rem] sm:text-[1.1rem] font-bold text-text-dark">Activity</h3>
          <p className="text-[0.75rem] text-text-dark-secondary mt-0.5">Last 31 days</p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm">
          <Calendar size={16} className="text-text-dark-secondary" />
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
        <div className="grid grid-cols-7 gap-[5px] sm:gap-[6px] justify-items-center max-w-[280px] mx-auto mb-2">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <span key={i} className="text-[10px] font-semibold text-gray-400">{d}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-[5px] sm:gap-[6px] justify-items-center max-w-[280px] mx-auto">
          {renderedHeatmap}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 mt-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-sf-teal" />
            <span className="text-[0.7rem] text-text-dark-secondary font-medium">Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-blue-400" />
            <span className="text-[0.7rem] text-text-dark-secondary font-medium">Frozen</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-sf-coral/40" />
            <span className="text-[0.7rem] text-text-dark-secondary font-medium">Missed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-[#e0f5f0] border border-dashed border-sf-teal/40" />
            <span className="text-[0.7rem] text-text-dark-secondary font-medium">Upcoming</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
