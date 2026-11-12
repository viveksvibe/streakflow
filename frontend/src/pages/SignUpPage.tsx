import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import Logo from '../components/common/Logo'
import ThemeToggle from '../components/common/ThemeToggle'
import { useAuthStore } from '../store/authStore'
import { useNavigator } from '../hooks/useNavigator'

const SignUpPage = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [matchError, setMatchError] = useState(false)
  const [formError, setFormError] = useState('')
  const { register, googleLogin, isLoading } = useAuthStore();
  const { goToHome } = useNavigator();

  const googleLoginAction = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const success = await googleLogin(tokenResponse.access_token);
      if (success) goToHome();
    },
    onError: () => {
      console.error("Google signup failed.");
    }
  });

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const { fullName, email, password, confirmPassword } = form;
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormError('')
    if (e.target.name === 'confirmPassword') setMatchError(false)
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // They already typed both halves of the pair — check as soon as they leave the field.
  const validateMatchOnBlur = () => {
    if (confirmPassword && password && confirmPassword !== password) {
      setMatchError(true)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setMatchError(true)
      return
    }
    setFormError('')
    const success = await register({ fullName, email, password, confirmPassword })
    if (!success) {
      setFormError("Couldn't create your account. Check your details and try again.")
      return
    }
    goToHome()
  }

  const inputWrapperClass =
    'flex items-center gap-2.5 rounded-[12px] border border-line bg-well px-3.5 h-10 transition-colors duration-200 focus-within:border-brand-ring focus-within:ring-2 focus-within:ring-brand-ring/30'

  const inputClass =
    'flex-1 bg-transparent border-none outline-none text-ink text-[0.85rem] font-medium h-full placeholder:text-ink-mute'

  const labelClass =
    'text-[0.78rem] font-medium text-ink-mute'

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center bg-page px-5 py-8 sm:px-6 sm:py-10">
      {/* Theme toggle, pinned to the corner */}
      <div className="absolute top-5 right-5">
        <ThemeToggle />
      </div>

      {/* Logo */}
      <div className="mb-6 relative z-10">
        <Logo size="md" />
      </div>

      {/* Heading */}
      <div className="mb-6 text-center relative z-10">
        <h1 className="font-display text-[1.5rem] font-semibold tracking-[-0.02em] text-ink">
          Start your first streak
        </h1>
        <p className="mt-1.5 text-[0.85rem] text-ink-mid">
          Free forever. Your first freeze is waiting.
        </p>
      </div>

      {/* Form Card */}
      <form
        className="relative z-10 flex w-full max-w-[420px] flex-col gap-4 rounded-3xl border border-line bg-surface p-5 shadow-[var(--sf-card-shadow)] sm:p-6"
        onSubmit={handleSubmit}
      >
        {/* Auth error, announced to screen readers and visible in DOM order */}
        {formError && (
          <p
            role="alert"
            id="signup-error"
            className="rounded-[10px] bg-danger-soft border border-danger-line px-3.5 py-2.5 text-[0.8rem] font-medium leading-snug text-danger-text"
          >
            {formError}
          </p>
        )}

        {/* Full Name */}
        <div className="flex flex-col gap-2">
          <label className={labelClass} htmlFor="fullName">
            Full Name
          </label>
          <div className={inputWrapperClass}>
            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Alex Carter"
              value={form.fullName}
              onChange={handleChange}
              className={inputClass}
              autoComplete="name"
            />
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-2">
          <label className={labelClass} htmlFor="email">
            Email
          </label>
          <div className={inputWrapperClass}>
            <Mail className="shrink-0 text-ink-mute" size={16} />
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              className={inputClass}
              autoComplete="email"
            />
          </div>
        </div>

        {/* Password */}
        <div className="flex flex-col gap-2">
          <label className={labelClass} htmlFor="password">
            Password
          </label>
          <div className={inputWrapperClass}>
            <Lock className="shrink-0 text-ink-mute" size={16} />
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 8 characters"
              value={form.password}
              onChange={handleChange}
              className={inputClass}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="flex cursor-pointer items-center justify-center border-none bg-transparent p-1 text-ink-mute transition-colors duration-200 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col gap-2">
          <label className={labelClass} htmlFor="confirmPassword">
            Confirm Password
          </label>
          <div className={
            matchError
              ? `${inputWrapperClass} border-ember`
              : inputWrapperClass
          }>
            <Lock className="shrink-0 text-ink-mute" size={16} />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Type it once more"
              value={form.confirmPassword}
              onChange={handleChange}
              onBlur={validateMatchOnBlur}
              aria-describedby={matchError ? 'confirm-error' : undefined}
              aria-invalid={matchError || undefined}
              className={inputClass}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="flex cursor-pointer items-center justify-center border-none bg-transparent p-1 text-ink-mute transition-colors duration-200 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {matchError && (
            <p id="confirm-error" role="alert" className="text-[0.78rem] font-medium text-danger-text">
              Passwords don't match.
            </p>
          )}
        </div>

        {/* Terms Checkbox */}
        <label className="mt-0.5 flex cursor-pointer items-start gap-2.5" htmlFor="terms-checkbox">
          <input
            type="checkbox"
            id="terms-checkbox"
            className="custom-check mt-0.5"
            checked={agreed}
            onChange={() => setAgreed(!agreed)}
          />
          {/* AUDIT FIX [9.2]: Link to dedicated Terms and Privacy routes */}
          <span className="text-[0.78rem] leading-snug text-ink-mid">
            I agree to the{' '}
            <Link
              to="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-ink underline-2 hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              Terms
            </Link>{' '}
            &amp;{' '}
            <Link
              to="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-ink underline-2 hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              Privacy Policy
            </Link>
          </span>
        </label>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isLoading || !agreed}
          className="btn-ember w-full disabled:cursor-not-allowed disabled:opacity-60"
          whileTap={isLoading || !agreed ? undefined : { scale: 0.99 }}
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={17} />
          ) : (
            'Create account'
          )}
        </motion.button>

        <div className="flex items-center gap-3">
          <hr className="flex-1 border-t border-line" />
          <span className="text-[0.75rem] text-ink-mute">or</span>
          <hr className="flex-1 border-t border-line" />
        </div>

        <motion.button
          type="button"
          onClick={() => googleLoginAction()}
          className="btn-swap flex h-10 w-full cursor-pointer items-center justify-center gap-3 rounded-[12px] text-[0.85rem] font-semibold"
          whileTap={{ scale: 0.99 }}
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="" aria-hidden="true" className="h-4.5 w-4.5" />
          Continue with Google
        </motion.button>
      </form>

      {/* Sign In Link */}
      <p className="mt-5 text-[0.85rem] text-ink-mid relative z-10">
        Already keeping streaks?{' '}
        <button
          type="button"
          onClick={() => navigate('/signin')}
          className="cursor-pointer bg-transparent border-none font-semibold text-ink underline-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          Sign in
        </button>
      </p>
    </div>
  )
}

export default SignUpPage
