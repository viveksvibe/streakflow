import { memo } from 'react'
import { Flame, Trophy } from 'lucide-react'

interface Props {
  currentStreak: number;
  bestStreak: number;
}

export const StreakCurrentCard = memo(({ currentStreak, bestStreak }: Props) => (
  <div className="-mt-5 bg-surface border border-line rounded-2xl p-5 sm:p-6 shadow-[var(--sf-card-shadow)] flex flex-col items-center text-center relative z-10">
    <span className="text-[0.68rem] font-semibold text-ink-mute mb-2">
      current streak
    </span>

    <div className="flex items-center gap-1.5 mb-0.5">
      <Flame size={20} className="text-ember" />
      <span className="font-display text-[1.8rem] sm:text-[2rem] font-bold text-ink leading-none tabular-nums">
        {currentStreak}
      </span>
    </div>
    <span className="text-[0.75rem] sm:text-[0.8rem] text-ink-mute font-semibold mb-3">
      day streak
    </span>

    <div className="flex items-center gap-1.5 bg-well px-3 py-1 rounded-full">
      <Trophy size={11} className="text-amber-500" />
      <span className="text-[0.72rem] sm:text-[0.75rem] font-bold text-ink-mid tabular-nums">
        Best: {bestStreak} days
      </span>
    </div>
  </div>
));

StreakCurrentCard.displayName = 'StreakCurrentCard';
