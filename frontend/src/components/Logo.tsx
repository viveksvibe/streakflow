import { Flame } from 'lucide-react'
import { motion } from 'framer-motion'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
}

const Logo = ({ size = 'md' }: LogoProps) => {
  const iconSizes = { sm: 18, md: 22, lg: 26 }
  const textSizes = { sm: 'text-base', md: 'text-lg', lg: 'text-xl' }

  return (
    <motion.div
      className="flex items-center gap-2"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-9 h-9 rounded-[10px] bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
        <Flame size={iconSizes[size]} strokeWidth={2.2} />
      </div>
      <span className={`${textSizes[size]} font-bold text-white tracking-tight`}>
        StreakFlow
      </span>
    </motion.div>
  )
}

export default Logo
