import { memo, useMemo } from 'react'
import { useAuthStore } from '../../store/authStore'

export const HomeHeader = memo(() => {
  const user = useAuthStore((state) => state.user)

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  }, [])

  return (
    <header className="pt-6 sm:pt-8 pb-2 flex items-center justify-between">
      <div>
        <h1 className="font-display text-[1.35rem] sm:text-[1.5rem] font-bold text-ink tracking-tight leading-tight">
          {greeting}, {user?.fullName}
        </h1>
        <p className="mt-1 text-[0.8rem] text-ink-mute font-normal">
          You're on a roll. Keep it up.
        </p>
      </div>
    </header>
  )
})

HomeHeader.displayName = 'HomeHeader'
