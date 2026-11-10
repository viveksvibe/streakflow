// AUDIT FIX [9.1]: Equal-weight cookie consent banner complying with ePrivacy & GDPR
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie } from 'lucide-react'
import { Link } from 'react-router-dom'

const CONSENT_KEY = 'sf_cookie_consent_choice'

export const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(CONSENT_KEY)
    if (!saved) {
      setIsVisible(true)
    }
  }, [])

  const handleChoice = (decision: 'accepted' | 'declined') => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({
      decision,
      timestamp: new Date().toISOString()
    }))
    setIsVisible(false)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.aside
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.25 }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 p-4 sm:p-5 rounded-2xl bg-surface border border-line shadow-xl text-ink"
          role="region"
          aria-label="Cookie preferences"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0 mt-0.5">
              <Cookie size={20} />
            </div>
            <div className="flex-1 text-xs sm:text-sm text-ink-mid">
              <p className="font-semibold text-ink text-sm mb-1">We value your privacy</p>
              <p className="leading-relaxed">
                We use strictly necessary cookies to keep you signed in securely. Read our{' '}
                <Link to="/privacy" className="text-brand font-medium underline underline-offset-2">
                  Privacy Policy
                </Link>{' '}
                to learn more.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-line/60">
            <button
              type="button"
              onClick={() => handleChoice('declined')}
              className="flex-1 py-2 px-3 rounded-xl border border-line bg-surface hover:bg-well text-xs font-semibold text-ink transition-colors cursor-pointer"
            >
              Essential Only
            </button>
            <button
              type="button"
              onClick={() => handleChoice('accepted')}
              className="flex-1 py-2 px-3 rounded-xl bg-brand hover:opacity-95 text-on-brand text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              Accept All
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
