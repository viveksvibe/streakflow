import { memo } from 'react'
import { Snowflake } from 'lucide-react'

interface Props {
  freezesLeft: number;
  isLoading: boolean;
  isActionTakenToday: boolean;
  todayStatus: string | undefined;
  markedToday: boolean;
  onUseFreeze: () => void;
}

export const StreakFreezeCard = memo(({
  freezesLeft, isLoading, isActionTakenToday, todayStatus, markedToday, onUseFreeze
}: Props) => (
  <div className="mt-4 sm:mt-5 bg-surface border border-line rounded-2xl p-4 sm:p-5 shadow-[var(--sf-card-shadow)] flex items-center gap-3.5">
    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-frost/15 flex items-center justify-center shrink-0">
      <Snowflake size={22} className="text-frost" />
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="text-[0.9rem] sm:text-[0.95rem] font-bold text-ink">
        Streak Freeze
      </h4>
      <p className="text-[0.75rem] sm:text-[0.78rem] text-ink-mute mt-0.5 tabular-nums">
        {freezesLeft} freezes left this month
      </p>
    </div>
    <button
      className={`px-4 py-2 rounded-xl text-[0.82rem] sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
        freezesLeft > 0 && !isLoading && !isActionTakenToday
          ? 'text-brand bg-brand/10 hover:bg-brand/20 active:scale-95'
          : 'text-ink-mute bg-well cursor-not-allowed'
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
  </div>
));

StreakFreezeCard.displayName = 'StreakFreezeCard';
