import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import Logo from '../components/common/Logo'
import ThemeToggle from '../components/common/ThemeToggle'
import { useAuthStore } from '../store/authStore'
import { useNavigator } from '../hooks/useNavigator'

const SignInPage = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  const [form, setForm] = useState({
    email: '',
    password: '',
  })
  const [formError, setFormError] = useState('')

  const { email, password } = form;
  const { goToHome } = useNavigator();
  const { login, googleLogin, isLoading } = useAuthStore();

  const googleLoginAction = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const success = await googleLogin(tokenResponse.access_token);
      if (success) goToHome();
    },
    onError: () => {
      console.error("Google login failed.");
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormError('')
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    const success = await login({ email, password })
    if (!success) {
      setFormError("Email or password doesn't match an account.")
      return
    }
    goToHome()
  }

  const inputWrapperClass =
    'flex items-center gap-2.5 rounded-[12px] border border-line bg-well px-3.5 h-12 transition-colors duration-200 focus-within:border-brand-ring focus-within:ring-2 focus-within:ring-brand-ring/30'

  const inputClass =
    'flex-1 bg-transparent border-none outline-none text-ink text-[0.95rem] font-medium h-full placeholder:text-ink-mute'

  const labelClass =
    'text-[13px] font-medium text-ink-mute'

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center bg-page px-5 py-8 sm:px-6 sm:py-10">
      {/* Theme toggle, pinned to the corner */}
      <div className="absolute top-5 right-5">
        <ThemeToggle />
      </div>

      {/* Logo */}
      <div className="mb-8 relative z-10">
        <Logo size="md" />
      </div>

      {/* Heading */}
      <div className="mb-7 text-center relative z-10">
        <h1 className="font-display text-[30px] font-semibold tracking-[-0.02em] text-ink">
          Welcome back
        </h1>
        <p className="mt-2 text-[15px] text-ink-mid">
          Sign in to keep your streaks alive
        </p>
      </div>

      {/* Form Card */}
      <form
        className="relative z-10 flex w-full max-w-[420px] flex-col gap-5 rounded-3xl border border-line bg-surface p-6 shadow-[var(--sf-card-shadow)] sm:p-7"
        onSubmit={handleSubmit}
      >
        {/* Auth error, announced to screen readers and visible in DOM order */}
        {formError && (
          <p
            role="alert"
            id="signin-error"
            className="rounded-[10px] bg-danger-soft border border-danger-line px-3.5 py-2.5 text-[13.5px] font-medium leading-snug text-danger-text"
          >
            {formError}
          </p>
        )}

        {/* Email */}
        <div className="flex flex-col gap-2">
          <label className={labelClass} htmlFor="signin-email">
            Email
          </label>
          <div className={inputWrapperClass}>
            <Mail className="shrink-0 text-ink-mute" size={17} />
            <input
              id="signin-email"
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
          <div className="flex items-center justify-between">
            <label className={labelClass} htmlFor="signin-password">
              Password
            </label>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="text-[12.5px] text-ink-mute transition-colors duration-200 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              Forgot password?
            </a>
          </div>
          <div className={inputWrapperClass}>
            <Lock className="shrink-0 text-ink-mute" size={17} />
            <input
              id="signin-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Your password"
              value={form.password}
              onChange={handleChange}
              className={inputClass}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="flex cursor-pointer items-center justify-center border-none bg-transparent p-1 text-ink-mute transition-colors duration-200 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isLoading}
          className="btn-ember w-full disabled:cursor-not-allowed disabled:opacity-60"
          whileTap={isLoading ? undefined : { scale: 0.99 }}
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            'Sign in'
          )}
        </motion.button>

        <div className="flex items-center gap-3">
          <hr className="flex-1 border-t border-line" />
          <span className="text-[12.5px] text-ink-mute">or</span>
          <hr className="flex-1 border-t border-line" />
        </div>

        <motion.button
          type="button"
          onClick={() => googleLoginAction()}
          className="btn-swap flex h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-[12px] text-[15px] font-semibold"
          whileTap={{ scale: 0.99 }}
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="" aria-hidden="true" className="h-5 w-5" />
          Continue with Google
        </motion.button>
      </form>

      {/* Sign Up Link */}
      <p className="mt-6 text-[14.5px] text-ink-mid relative z-10">
        New to StreakFlow?{' '}
        <button
          type="button"
          onClick={() => navigate('/signup')}
          className="cursor-pointer bg-transparent border-none font-semibold text-ink underline-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          Create an account
        </button>
      </p>
    </div>
  )
}

export default SignInPage
