import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'

interface LoaderProps {
  /** 'fullscreen' covers entire viewport, 'inline' fits inside a container */
  variant?: 'fullscreen' | 'inline'
  /** Optional message to display */
  message?: string
}

export default function Loader({ variant = 'fullscreen', message = 'Loading' }: LoaderProps) {
  const isFullscreen = variant === 'fullscreen'

  return (
    <motion.div
      className={`flex flex-col items-center justify-center ${
        isFullscreen ? 'fixed inset-0 z-[999]' : 'w-full py-20'
      }`}
      style={
        isFullscreen
          ? {
              background:
                'linear-gradient(170deg, #1a8a7d 0%, #2cb5a0 20%, #5ec4a8 35%, #b8a89a 50%, #d4916e 65%, #c96b8a 80%, #8b6b8a 100%)',
            }
          : undefined
      }
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      id="app-loader"
    >
      {/* ====== Orbiting ring container ====== */}
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
        {/* Outer spinning ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            border: '2.5px solid transparent',
            borderTopColor: isFullscreen ? 'rgba(255,255,255,0.7)' : '#2cb5a0',
            borderRightColor: isFullscreen ? 'rgba(255,255,255,0.2)' : 'rgba(44,181,160,0.2)',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
        />

        {/* Second ring — counter‑rotate */}
        <motion.div
          className="absolute inset-2 rounded-full"
          style={{
            border: '2px solid transparent',
            borderBottomColor: isFullscreen ? 'rgba(255,255,255,0.45)' : 'rgba(44,181,160,0.45)',
            borderLeftColor: isFullscreen ? 'rgba(255,255,255,0.1)' : 'rgba(44,181,160,0.1)',
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />

        {/* Orbiting dot */}
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
        >
          <div
            className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full shadow-lg ${
              isFullscreen ? 'bg-white' : 'bg-sf-teal'
            }`}
            style={{
              boxShadow: isFullscreen
                ? '0 0 12px rgba(255,255,255,0.6)'
                : '0 0 12px rgba(44,181,160,0.5)',
            }}
          />
        </motion.div>

        {/* Center glass card with flame */}
        <motion.div
          className={`w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-2xl flex items-center justify-center ${
            isFullscreen
              ? 'bg-white/15 border border-white/25 backdrop-blur-xl'
              : 'bg-sf-teal/10 border border-sf-teal/20'
          }`}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <motion.div
            animate={{ y: [0, -3, 0], opacity: [0.85, 1, 0.85] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Flame
              size={28}
              strokeWidth={2}
              className={isFullscreen ? 'text-white' : 'text-sf-teal'}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* ====== Brand text ====== */}
      <motion.div
        className="mt-8 flex flex-col items-center gap-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {/* Logo text */}
        <h2
          className={`text-xl sm:text-2xl font-bold tracking-tight ${
            isFullscreen ? 'text-white' : 'text-text-dark'
          }`}
        >
          Streak
          <span className={isFullscreen ? 'text-white/70' : 'text-sf-teal'}>
            Flow
          </span>
        </h2>

        {/* Loading message with animated dots */}
        <div className="flex items-center gap-0.5">
          <span
            className={`text-sm font-medium ${
              isFullscreen ? 'text-white/60' : 'text-text-dark-secondary'
            }`}
          >
            {message}
          </span>
          <span className="flex gap-[2px] ml-0.5">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className={`inline-block w-[4px] h-[4px] rounded-full ${
                  isFullscreen ? 'bg-white/50' : 'bg-text-dark-secondary'
                }`}
                animate={{ opacity: [0.2, 1, 0.2], y: [0, -3, 0] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </span>
        </div>
      </motion.div>

      {/* ====== Decorative floating particles (fullscreen only) ====== */}
      {isFullscreen && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-white/20"
              style={{
                left: `${15 + i * 14}%`,
                top: `${20 + (i % 3) * 25}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0, 0.6, 0],
                scale: [0.5, 1.2, 0.5],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.4,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}