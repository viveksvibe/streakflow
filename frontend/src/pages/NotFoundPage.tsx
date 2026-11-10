// AUDIT FIX [10.1]: Dedicated, accessible 404 Error Page with recovery navigation
import { motion } from 'framer-motion'
import { Flame, Home, ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-app flex flex-col justify-between p-4 sm:p-6 text-ink selection:bg-brand selection:text-on-brand">
      <header className="max-w-4xl mx-auto w-full pt-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center text-on-brand shadow-md">
            <Flame size={22} />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-ink">StreakFlow</span>
        </Link>
      </header>

      <main className="max-w-md mx-auto w-full text-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-ember/10 text-ember mb-6 shadow-sm">
            <Flame size={44} />
          </div>

          <h1 className="text-6xl font-display font-extrabold text-ink tracking-tight mb-3">
            404
          </h1>
          <h2 className="text-xl sm:text-2xl font-bold text-ink mb-3">
            Streak not found
          </h2>
          <p className="text-ink-mute text-sm sm:text-base mb-8 max-w-sm mx-auto leading-relaxed">
            The page you are looking for has moved, expired, or doesn’t exist. Keep your momentum going by returning home.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-line bg-surface hover:bg-well font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <ArrowLeft size={16} />
              Go Back
            </button>
            <Link
              to="/"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand text-on-brand hover:opacity-95 font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Home size={16} />
              Return Home
            </Link>
          </div>
        </motion.div>
      </main>

      <footer className="max-w-4xl mx-auto w-full pb-4 text-center text-xs text-ink-mute">
        © {new Date().getFullYear()} StreakFlow. All rights reserved.
      </footer>
    </div>
  )
}
