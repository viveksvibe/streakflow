import { memo } from "react";
import type { DashboardUser } from "../../store/statStore";

interface Props {
  user: DashboardUser;
}

export const DashboardHeader = memo(({ user }: Props) => (
  <div className="pt-10">
    <h1 className="font-display text-[1.35rem] sm:text-[1.5rem] font-bold text-ink">
      Your Progress
    </h1>
    <p className="text-[0.8rem] sm:text-[0.85rem] text-ink-mute mt-1">
      Keep going, {user.fullName}
    </p>
  </div>
));

DashboardHeader.displayName = 'DashboardHeader';
