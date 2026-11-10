import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/common/Logo'
import ThemeToggle from '../components/common/ThemeToggle'

const DAY_HEADER =
  'grid h-6 w-6 place-items-center font-sans text-[11px] font-semibold tracking-[0.14em] text-ink-mute'
const DAY_DONE =
  'grid h-10 w-6 place-items-center rounded-[10px] bg-brand font-sans text-[15px] font-semibold text-on-brand transition-colors duration-200 sm:h-12'
const DAY_UPCOMING =
  'grid h-10 w-6 place-items-center rounded-[10px] border border-line bg-well font-sans text-[13px] text-ink-mute transition-colors duration-200 sm:h-12'
const CARD =
  'rounded-3xl border border-line bg-surface px-6 py-7 shadow-[var(--sf-card-shadow)] sm:px-9 sm:py-9'
const SECTION_TITLE =
  'font-display text-[19px] font-medium leading-snug tracking-tight text-ink'
const BODY_ON_INK = 'text-[14px] leading-relaxed text-ink-mute'
const RULE = 'border-t border-line'
const FEATURE = 'border-l-2 border-line pl-4'

export default function WelcomePage() {
  const navigate = useNavigate()
  const [completed, setCompleted] = useState(
    typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 5
      : 0,
  )

  // The chain fills itself on load — one orchestrated moment, nothing else animates.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let count = 0
    const timer = setInterval(() => {
      count += 1
      setCompleted(count)
      if (count >= 5) clearInterval(timer)
    }, 190)
    return () => clearInterval(timer)
  }, [])

  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

  return (
    <main className="flex min-h-dvh flex-col bg-page lg:h-dvh lg:overflow-hidden">
      {/* ————— Top bar ————— */}
      <header className="flex h-16 shrink-0 items-center justify-between px-5 sm:px-8 lg:px-10">
        <Logo size="md" />
        <div className="flex items-center gap-4">          <ThemeToggle />
          <button
          onClick={() => navigate('/signin')}
          className="text-[15px] font-medium text-ink-mid underline-2 transition-colors duration-200 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus cursor-pointer"
        >
          Sign in
        </button>
        </div>
      </header>

      {/* ————— Hero: pitch left, live streak record right ————— */}
      <section className="grid flex-1 grid-cols-1 items-center gap-12 px-5 pb-14 pt-8 sm:px-8 lg:grid-cols-[44%_56%] lg:gap-16 lg:px-10 lg:pb-10 lg:pt-0">
        {/* Left — the pitch */}
        <div className="max-w-[520px] lg:justify-self-end">
          <h1 className="font-display text-[clamp(52px,6.4vw,94px)] font-semibold leading-[0.94] tracking-[-0.032em] text-ink">
            Show up
            <br />
            every day.
          </h1>

          <p className="mt-7 max-w-[34ch] text-[17px] leading-[1.65] text-ink-mid">
            StreakFlow records one honest number: your current streak. And when
            a bad day hits, monthly freezes keep months of work intact.
          </p>

          <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center">
            <button
              className="btn-ember cursor-pointer"
              onClick={() => navigate('/signup')}
            >
              Start your first streak
            </button>

            <p className="text-[14px] text-ink-mute">
              3 freezes, refilled monthly
            </p>
          </div>

          <p className="mt-9 text-[14px] text-ink-mute">
            Free forever.
          </p>
        </div>

        {/* Right — the live record */}
        <div className="w-full max-w-[680px] justify-self-center lg:justify-self-start">
          <div className={CARD}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
              <span className="font-display text-[17px] font-medium tracking-tight text-ink">
                Morning run
              </span>
              <span className="text-[15px] tabular-nums text-ink-mute">
                {completed} / 7 this week
              </span>
            </div>

            {/* The chain */}
            <div
              className="mt-8 grid grid-cols-7 gap-1.5 sm:gap-2"
              role="img"
              aria-label={`Streak demo: ${completed} of 7 days completed`}
            >
              {days.map((label, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <span className={DAY_HEADER}>{label}</span>
                  {i < completed ? (
                    <span className={DAY_DONE}>✓</span>
                  ) : (
                    <span className={DAY_UPCOMING}>·</span>
                  )}
                </div>
              ))}
            </div>

            {/* Freeze ledger */}
            <div className={`${RULE} mt-8 flex items-start gap-5 pt-5`}>
              <span
                className="font-display text-[38px] font-semibold leading-none tracking-tight text-[var(--sf-freeze)] tabular-nums"
                aria-hidden="true"
              >
                3
              </span>
              <div>
                <p className="font-sans text-[13px] font-medium leading-tight text-ink-mute">
                  Freeze days left this month
                </p>
                <p className="mt-1.5 text-[14px] leading-relaxed text-ink-mute">
                  Miss a day and a freeze keeps the streak alive. Refills on the
                  1st.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ————— Logbook strip: the three load-bearing features ————— */}
      <section className="hidden pb-12 lg:block">
        <div className="mx-auto grid max-w-6xl grid-cols-3 gap-10 px-10">
          <div className={FEATURE}>
            <h2 className={SECTION_TITLE}>Streak freeze</h2>
            <p className={`mt-1.5 ${BODY_ON_INK}`}>
              Spend a freeze when life gets in the way — the streak stays live.
            </p>
          </div>
          <div className={FEATURE}>
            <h2 className={SECTION_TITLE}>Reminder windows</h2>
            <p className={`mt-1.5 ${BODY_ON_INK}`}>
              Pick a time your day actually allows. One nudge, quietly.
            </p>
          </div>
          <div className={FEATURE}>
            <h2 className={SECTION_TITLE}>Heatmap history</h2>
            <p className={`mt-1.5 ${BODY_ON_INK}`}>
              Every completed day shades one cell. The record speaks.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
