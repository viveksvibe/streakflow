import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, LogIn, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import Logo from '../components/Logo'
import { useAuthStore } from '../store/authStore'
import { useNavigator } from '../hooks/useNavigator'

const SignInPage = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  const {email,password} = form;
  const {goToHome} = useNavigator();
  const {login, googleLogin, isLoading} = useAuthStore();

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
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const success = await login({ email, password })
    if (success) {
      goToHome()
    }
  }

  const inputWrapperClass =
    'flex items-center gap-2 bg-white/[0.18] backdrop-blur-xl border border-white/25 rounded-xl px-3 sm:px-4 h-11 sm:h-12 transition-all duration-300 focus-within:border-white/50 focus-within:bg-white/[0.24] focus-within:shadow-[0_0_0_3px_rgba(255,255,255,0.12)]'

  const inputClass =
    'flex-1 bg-transparent text-white text-[0.935rem] font-medium h-full outline-none border-none placeholder:text-white/65'

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-5 sm:px-6 py-8 sm:py-10 relative overflow-hidden">
      {/* Background overlay */}
      <div
        className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 20% 20%, rgba(44,181,160,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(201,107,138,0.15) 0%, transparent 50%)',
          animation: 'subtleFloat 20s ease-in-out infinite',
        }}
      />

      {/* Logo */}
      <motion.div
        className="mb-6 sm:mb-8 relative z-10"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Logo size="md" />
      </motion.div>

      {/* Heading */}
      <motion.div
        className="text-center mb-5 sm:mb-6 relative z-10"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl sm:text-[1.85rem] font-extrabold text-white tracking-tight leading-tight">
          Welcome back{' '}
          <span className="inline-block text-xl sm:text-[1.4rem]">👋</span>
        </h1>
        <p className="mt-1.5 sm:mt-2 text-sm text-white/80 font-normal">
          Sign in to continue your streaks
        </p>
      </motion.div>



      {/* Form Card */}
      <motion.form
        className="w-full max-w-[420px] bg-white/12 backdrop-blur-[20px] border border-white/20 rounded-2xl p-5 sm:p-7 flex flex-col gap-4 sm:gap-5 relative z-10"
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.15 }}
      >
        {/* Email */}
        <div className="flex flex-col gap-1.5 sm:gap-2">
          <label className="text-[0.82rem] sm:text-[0.85rem] font-medium text-white tracking-wide" htmlFor="signin-email">
            Email
          </label>
          <div className={inputWrapperClass}>
            <Mail className="text-white/50 shrink-0" size={18} />
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
        <div className="flex flex-col gap-1.5 sm:gap-2">
          <div className="flex items-center justify-between">
            <label className="text-[0.82rem] sm:text-[0.85rem] font-medium text-white tracking-wide" htmlFor="signin-password">
              Password
            </label>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="text-[0.75rem] sm:text-[0.78rem] text-white/50 no-underline transition-colors duration-200 hover:text-white hover:underline hover:underline-offset-2"
            >
              Forgot password?
            </a>
          </div>
          <div className={inputWrapperClass}>
            <Lock className="text-white/50 shrink-0" size={18} />
            <input
              id="signin-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              className={inputClass}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="bg-transparent border-none text-white/50 cursor-pointer p-1 flex items-center justify-center transition-colors duration-200 hover:text-white"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isLoading}
          className="btn-shimmer w-full h-12 sm:h-[52px] bg-surface-dark text-white rounded-xl text-[0.935rem] sm:text-base font-semibold flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.3)] active:translate-y-0 mt-1 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          id="sign-in-btn"
          whileTap={{ scale: 0.98 }}
        >
          <LogIn size={18} />
          {
            isLoading ? <><Loader2 className="animate-spin" size={18} /><span>Signing In...</span></> : <span>Sign In</span>
          }
        </motion.button>

        <div className="flex items-center gap-3 my-1">
          <hr className="flex-1 border-white/20" />
          <span className="text-white/50 text-xs uppercase tracking-wider font-semibold">Or continue with</span>
          <hr className="flex-1 border-white/20" />
        </div>
        
        <div className="flex justify-center w-full relative z-20">
          <motion.button
            type="button"
            onClick={() => googleLoginAction()}
            className="w-full h-12 sm:h-[52px] bg-white text-gray-900 rounded-xl text-[0.935rem] sm:text-base font-semibold flex items-center justify-center gap-3 cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(255,255,255,0.2)] active:translate-y-0"
            whileTap={{ scale: 0.98 }}
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            Continue with Google
          </motion.button>
        </div>
      </motion.form>

      {/* Sign Up Link */}
      <motion.p
        className="mt-5 sm:mt-6 text-sm text-white/80 text-center relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Don't have an account?{' '}
        <button
          type="button"
          onClick={() => navigate('/signup')}
          className="text-white font-bold bg-transparent border-none cursor-pointer underline underline-offset-2 text-sm hover:decoration-2"
        >
          Sign Up
        </button>
      </motion.p>
    </div>
  )
}

export default SignInPage
