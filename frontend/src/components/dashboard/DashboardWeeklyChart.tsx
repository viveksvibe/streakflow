import { useMemo } from "react";
import type { DashboardResponse } from "../../store/statStore";

interface Props {
  dashboardData: DashboardResponse;
}

const CHART_H = 120; // px — the bar area height (excludes labels)
const MIN_BAR_H = 6;  // px — minimum visible bar height for non-zero days

export const DashboardWeeklyChart = ({ dashboardData }: Props) => {
  const { weeklyProgress } = dashboardData.stats;
  const todayDate = dashboardData.today.localDate;

  const maxVal = useMemo(
    () => Math.max(...weeklyProgress.map((d) => d.completedHabits), 1),
    [weeklyProgress]
  );

  const totalThisWeek = useMemo(
    () => weeklyProgress.reduce((sum, d) => sum + d.completedHabits, 0),
    [weeklyProgress]
  );

  const weekRange = useMemo(() => {
    if (weeklyProgress.length === 0) return "";
    const fmt = (d: string) =>
      new Date(d + "T00:00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    return `${fmt(weeklyProgress[0].date)} – ${fmt(weeklyProgress[weeklyProgress.length - 1].date)}`;
  }, [weeklyProgress]);

  return (
    <div className="mt-6 bg-surface border border-line rounded-2xl shadow-[var(--sf-card-shadow)] overflow-hidden">

      {/* ── Header ── */}
      <div className="px-5 pt-5 pb-4 flex items-start justify-between gap-4 border-b border-line">
        <div>
          <h3 className="font-display font-semibold text-[0.9rem] sm:text-[15px] text-ink leading-tight">
            This week
          </h3>
          <p className="text-[11px] sm:text-[12px] text-ink-mute mt-0.5">{weekRange}</p>
        </div>
        <div className="shrink-0 text-right">
          <span className="font-display text-2xl font-bold text-ink tabular-nums leading-none">
            {totalThisWeek}
          </span>
          <p className="text-[10px] sm:text-[11px] text-ink-mute mt-0.5">
            {totalThisWeek === 1 ? "completion" : "completions"}
          </p>
        </div>
      </div>

      {/* ── Chart ── */}
      <div className="px-4 pt-4 pb-4">
        {weeklyProgress.length === 0 ? (
          <div className="flex items-center justify-center h-[120px] rounded-xl bg-well border border-dashed border-line">
            <p className="text-[0.8rem] sm:text-[13px] text-ink-mute">No data yet</p>
          </div>
        ) : (
          <div className="flex items-stretch gap-1.5">
            {weeklyProgress.map((day) => {
              const isToday = day.date === todayDate;
              const hasData = day.completedHabits > 0;
              const barH = hasData
                ? Math.round(Math.max((day.completedHabits / maxVal) * CHART_H, MIN_BAR_H))
                : 0;
              const dayLabel = new Date(day.date + "T00:00:00").toLocaleDateString("en-US", {
                weekday: "short",
              });

              return (
                <div
                  key={day.date}
                  className="flex-1 flex flex-col items-center"
                >
                  {/* Count label — sits in fixed space above the bar area */}
                  <div className="h-5 flex items-end justify-center mb-1">
                    {hasData && (
                      <span
                        className={`text-[9px] sm:text-[10px] font-bold tabular-nums leading-none ${
                          isToday ? "text-brand" : "text-ink-mid"
                        }`}
                        aria-hidden="true"
                      >
                        {day.completedHabits}
                      </span>
                    )}
                  </div>

                  {/* Bar area — fixed height, bar grows from bottom */}
                  <div
                    className="relative w-full flex items-end"
                    style={{ height: `${CHART_H}px` }}
                  >
                    {/* Background track */}
                    <div className="absolute inset-0 rounded-md bg-well/60" />

                    {/* Bar */}
                    {hasData && (
                      <div
                        className={`relative w-full rounded-md transition-none ${
                          isToday
                            ? "bg-brand"
                            : "bg-brand/40"
                        }`}
                        style={{ height: `${barH}px` }}
                      />
                    )}
                  </div>

                  {/* Day label */}
                  <span
                    className={`mt-2 text-[10px] sm:text-[11px] font-medium leading-none ${
                      isToday ? "text-brand font-semibold" : "text-ink-mute"
                    }`}
                  >
                    {dayLabel}
                  </span>

                  {/* Today indicator dot */}
                  <span
                    className={`mt-1 h-1.5 w-1.5 rounded-full ${
                      isToday ? "bg-brand" : "bg-transparent"
                    }`}
                    aria-hidden="true"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
