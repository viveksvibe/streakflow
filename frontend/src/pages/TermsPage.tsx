// AUDIT FIX [9.2]: Terms of Service page
import { Link } from 'react-router-dom'
import { Flame, ArrowLeft } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-app text-ink selection:bg-brand selection:text-on-brand p-4 sm:p-8">
      <header className="max-w-3xl mx-auto w-full pt-4 pb-8 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center text-on-brand shadow-md">
            <Flame size={20} />
          </div>
          <span className="font-display font-bold text-[1.1rem] tracking-tight text-ink">StreakFlow</span>
        </Link>
        <Link
          to="/"
          className="text-[0.85rem] font-semibold text-ink-mid hover:text-ink flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft size={15} /> Back
        </Link>
      </header>

      <main className="max-w-3xl mx-auto w-full bg-surface p-6 sm:p-10 rounded-3xl border border-line shadow-sm mb-12">
        <h1 className="text-[1.75rem] sm:text-[2rem] font-display font-bold text-ink mb-2">
          Terms of Service
        </h1>
        <p className="text-[0.75rem] text-ink-mute mb-8">
          Last updated: November 2026
        </p>

        <section className="space-y-6 text-[0.85rem] sm:text-sm text-ink-mid leading-relaxed">
          <div>
            <h2 className="text-[1rem] font-bold text-ink mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing and using StreakFlow, you agree to comply with and be bound by these Terms of Service. If you disagree with any part of these terms, please discontinue use of the service.
            </p>
          </div>

          <div>
            <h2 className="text-[1rem] font-bold text-ink mb-2">2. Use of Service</h2>
            <p>
              StreakFlow provides habit tracking, streak momentum calculations, and accountability tooling for individual use. You agree not to misuse the service, disrupt API endpoints, or conduct automated attacks.
            </p>
          </div>

          <div>
            <h2 className="text-[1rem] font-bold text-ink mb-2">3. User Accounts</h2>
            <p>
              You are responsible for safeguarding your login credentials. You must notify us immediately if you discover or suspect unauthorized access to your account.
            </p>
          </div>

          <div>
            <h2 className="text-[1rem] font-bold text-ink mb-2">4. Streak Mechanics & Freeze Credits</h2>
            <p>
              Streak counts and monthly freeze credits are provided as motivational tools. While we strive for 100% uptime and local timezone consistency, StreakFlow is provided on an "as-is" basis without warranties of continuous uninterrupted service.
            </p>
          </div>

          <div>
            <h2 className="text-[1rem] font-bold text-ink mb-2">5. Termination</h2>
            <p>
              You may close your account at any time via the profile settings. We reserve the right to suspend or terminate accounts that violate system policies or attempt malicious exploits.
            </p>
          </div>
        </section>
      </main>

      <footer className="max-w-3xl mx-auto w-full text-center text-[0.75rem] text-ink-mute pb-8">
        © {new Date().getFullYear()} StreakFlow. All rights reserved.
      </footer>
    </div>
  )
}
