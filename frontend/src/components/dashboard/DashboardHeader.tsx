import { memo } from "react";
import type { DashboardUser } from "../../store/statStore";

interface Props {
  user: DashboardUser;
}

export const DashboardHeader = memo(({ user }: Props) => (
  <div className="pt-10">
    <h1 className="font-display text-[1.5rem] sm:text-2xl font-bold text-ink">
      Your Progress
    </h1>
    <p className="text-[0.85rem] sm:text-sm text-ink-mute mt-1">
      Keep going, {user.fullName}
    </p>
  </div>
));

DashboardHeader.displayName = 'DashboardHeader';
