import { motion } from 'framer-motion'
import { ArrowRight, Users, Flame, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import HabitCard from '../components/HabitCard'

const WelcomePage = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-[70px] pb-10 px-6 relative overflow-hidden">
      {/* Animated background overlay */}
      <div
        className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 20% 20%, rgba(44,181,160,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(201,107,138,0.15) 0%, transparent 50%)',
          animation: 'subtleFloat 20s ease-in-out infinite',
        }}
      />

      {/* Logo - top left */}
      <div className="absolute top-6 left-6 z-10">
        <Logo size="md" />
      </div>

      {/* Heading */}
      <motion.div
        className="text-center mt-6 mb-7 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <h1 className="text-[2.1rem] md:text-[2.6rem] font-extrabold leading-[1.15] tracking-tight text-white">
          Build Unstoppable
          <br />
          Streaks with
          <br />
          <span className="bg-gradient-to-br from-white to-white/85 bg-clip-text text-transparent">
            StreakFlow
          </span>
        </h1>
        <p className="mt-3.5 text-[0.95rem] text-white/80 font-normal tracking-wide">
          Track habits. Grow streaks. Become consistent.
        </p>
      </motion.div>

      {/* Habit Card Preview */}
      <div className="flex justify-center w-full max-w-[400px] mb-8 relative z-10">
        <HabitCard />
      </div>

      {/* CTA Buttons */}
      <motion.div
        className="w-full max-w-[360px] flex flex-col gap-3 mb-8 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <button
          className="btn-shimmer w-full h-[52px] bg-surface-dark text-white rounded-xl text-base font-semibold flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.3)] active:translate-y-0"
          id="get-started-btn"
          onClick={() => navigate('/signup')}
        >
          Get Started
          <ArrowRight size={18} />
        </button>

        <button
          className="w-full h-[52px] bg-transparent text-white border-[1.5px] border-white/30 rounded-xl text-base font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 hover:bg-white/[0.08] hover:border-white/50 hover:-translate-y-0.5"
          id="login-btn"
          onClick={() => navigate('/signin')}
        >
          Login
        </button>
      </motion.div>

      {/* Bottom Badges */}
      <motion.div
        className="flex items-center gap-2.5 flex-wrap justify-center relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        {[
          { icon: <Users size={13} />, label: '10K+ users' },
          { icon: <Flame size={13} />, label: 'Streaks' },
          { icon: <Star size={13} />, label: '4.9 rated' },
        ].map((badge) => (
          <div
            key={badge.label}
            className="flex items-center gap-1.5 bg-black/25 backdrop-blur-md px-4 py-2 rounded-full text-[0.78rem] font-medium text-white border border-white/10"
          >
            {badge.icon}
            <span>{badge.label}</span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}

export default WelcomePage
