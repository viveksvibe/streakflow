// AUDIT FIX [9.2]: Privacy Policy page conforming to GDPR/CCPA disclosure requirements
import { Link } from 'react-router-dom'
import { Flame, ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p className="text-[0.75rem] text-ink-mute mb-8">
          Last updated: November 2026
        </p>

        <section className="space-y-6 text-[0.85rem] sm:text-sm text-ink-mid leading-relaxed">
          <div>
            <h2 className="text-[1rem] font-bold text-ink mb-2">1. Overview</h2>
            <p>
              StreakFlow is committed to protecting your privacy. This policy explains what information we collect, how it is used, and your rights regarding your personal data.
            </p>
          </div>

          <div>
            <h2 className="text-[1rem] font-bold text-ink mb-2">2. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Account Information:</strong> Name, email address, password hash, and avatar photo (if uploaded).</li>
              <li><strong>Habit & Streak Data:</strong> Habits created, daily completions, streak freezes, and timezone settings.</li>
              <li><strong>Authentication Data:</strong> Secure session tokens (JWTs) stored in HTTP-only cookies.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-[1rem] font-bold text-ink mb-2">3. Third-Party Services</h2>
            <p>
              We integrate trusted third-party providers for specific functions:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Google OAuth:</strong> For optional single sign-on authentication.</li>
              <li><strong>Cloudinary:</strong> For secure profile photo hosting.</li>
              <li><strong>Google Fonts:</strong> For typography rendering.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-[1rem] font-bold text-ink mb-2">4. Data Storage & Security</h2>
            <p>
              All passwords are encrypted with bcrypt before storage. Sensitive tokens are signed with cryptographically secure keys. Data is strictly scoped to your user account and never sold or shared with advertisers.
            </p>
          </div>

          <div>
            <h2 className="text-[1rem] font-bold text-ink mb-2">5. Your Rights</h2>
            <p>
              Under GDPR and CCPA, you have the right to access, export, or request deletion of your account and associated streak records at any time. To exercise these rights, please contact support.
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
