import { useMemo } from 'react'
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
      let bg: string;
      let border = '';

      if (markedToday && isToday) {
        bg = 'bg-brand';
      } else if (day.status === 'completed') {
        bg = 'bg-brand';
      } else if (day.status === 'frozen') {
        bg = 'bg-frost';
      } else if (day.status === 'missed') {
        bg = 'bg-danger/20';
      } else {
        bg = 'bg-well';
        border = 'border-[1.5px] border-dashed border-brand/40';
      }

      return (
        <div
          key={`day-${i}`}
          className={`flex items-center justify-center w-[32px] h-[32px] sm:w-[34px] sm:h-[34px] rounded-md sm:rounded-lg ${bg} ${border} transition-all duration-200`}
        >
          <span className={`text-[10px] font-medium ${
            bg === 'bg-brand' ? 'text-on-brand' :
            bg === 'bg-frost' ? 'text-ink' :
            'text-ink-mute'
          }`}>
            {new Date(day.date + 'T00:00:00').getDate()}
          </span>
        </div>
      )
    });

    return [...blanks, ...days];
  }, [heatmap, markedToday]);

  return (
    <div className="mt-6 sm:mt-7">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-[1.05rem] sm:text-[1.1rem] font-display font-bold text-ink">Activity</h3>
          <p className="text-[0.75rem] text-ink-mute mt-0.5">Last 31 days</p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-surface border border-line flex items-center justify-center shadow-sm">
          <Calendar size={16} className="text-ink-mid" />
        </div>
      </div>

      <div className="bg-surface border border-line rounded-2xl p-4 sm:p-5 shadow-[var(--sf-card-shadow)]">
        <div className="grid grid-cols-7 gap-[5px] sm:gap-[6px] justify-items-center max-w-[280px] mx-auto mb-2">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <span key={i} className="text-[10px] font-semibold text-ink-mute">{d}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-[5px] sm:gap-[6px] justify-items-center max-w-[280px] mx-auto">
          {renderedHeatmap}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 mt-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-brand" />
            <span className="text-[0.7rem] text-ink-mute font-medium">Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-frost" />
            <span className="text-[0.7rem] text-ink-mute font-medium">Frozen</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-danger/20" />
            <span className="text-[0.7rem] text-ink-mute font-medium">Missed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-well border border-dashed border-brand/40" />
            <span className="text-[0.7rem] text-ink-mute font-medium">Upcoming</span>
          </div>
        </div>
      </div>
    </div>
  );
};
