import { motion } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'

export const HomeHeader = () => {
  const { user } = useAuthStore()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <motion.header
      className="pt-6 sm:pt-8 pb-2 flex items-center justify-between"
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <h1 className="text-[1.55rem] sm:text-[1.7rem] font-extrabold text-text-dark tracking-tight leading-tight">
          {greeting}, {user?.fullName} <span className="inline-block text-xl">👋</span>
        </h1>
        <p className="mt-1 text-[0.85rem] text-text-dark-secondary font-normal">
          You're on a roll! Keep it up 🔥
        </p>
      </div>
    </motion.header>
  )
}
