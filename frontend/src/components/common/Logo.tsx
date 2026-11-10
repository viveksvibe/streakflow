import { Flame } from 'lucide-react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
}

const Logo = ({ size = 'md' }: LogoProps) => {
  const iconSizes = { sm: 18, md: 22, lg: 26 }
  const textSizes = { sm: 'text-base', md: 'text-lg', lg: 'text-xl' }

  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-brand text-on-brand">
        <Flame size={iconSizes[size]} strokeWidth={2.2} />
      </div>
      <span
        className={`${textSizes[size]} font-display font-semibold text-ink tracking-tight`}
      >
        StreakFlow
      </span>
    </div>
  )
}

export default Logo
