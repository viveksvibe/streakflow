import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Home,
  BarChart3,
  Flame,
  LogOut,
  Menu,
  X,
  ChevronDown,
  User,
  Loader2,
} from 'lucide-react'

import { useAuthStore } from '../../store/authStore'
import { ROUTES } from '../../constant'
import ThemeToggle from './ThemeToggle'

interface NavLink {
  label: string
  path: string
  icon: React.ReactNode
}

// Defined outside the component so the array reference never changes
const navLinks: NavLink[] = [
  { label: 'Home', path: ROUTES.HOME, icon: <Home size={18} /> },
  { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: <BarChart3 size={18} /> },
  { label: 'Streaks', path: ROUTES.STREAK, icon: <Flame size={18} /> },
]

const Navbar = memo(() => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, isLoading } = useAuthStore()

  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  // Detect scroll for navbar background intensity
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const closeMenus = useCallback(() => {
    setMobileOpen(false)
    setProfileOpen(false)
  }, [])

  const navigateTo = useCallback((path: string) => {
    closeMenus()
    navigate(path)
  }, [closeMenus, navigate])

  const handleLogout = useCallback(async () => {
    closeMenus()
    await logout()
    navigate(ROUTES.SIGNIN)
  }, [closeMenus, logout, navigate])

  const toggleProfile = useCallback(() => setProfileOpen((o) => !o), [])
  const toggleMobile = useCallback(() => setMobileOpen((o) => !o), [])
  const closeMobile = useCallback(() => setMobileOpen(false), [])

  const isActive = useCallback((path: string) => location.pathname === path, [location.pathname])

  const userInitial = useMemo(
    () => user?.fullName?.charAt(0)?.toUpperCase() || 'U',
    [user?.fullName]
  )

  return (
    <>
      {/* ====== Desktop / Tablet Navbar ====== */}
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-surface/90 shadow-[0_2px_24px_rgba(0,0,0,0.08)]'
            : 'bg-surface/60 shadow-none'
        } backdrop-blur-xl border-b border-line/50`}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
        id="main-navbar"
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-[64px]">
            {/* Logo */}
            <div
              className="cursor-pointer shrink-0"
              onClick={() => navigateTo(ROUTES.HOME)}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-sf-teal to-sf-teal-dark flex items-center justify-center text-on-brand shadow-[0_2px_10px_rgba(44,181,160,0.35)]">
                  <Flame size={18} strokeWidth={2.2} />
                </div>
                <span className="text-[1rem] font-bold text-ink tracking-tight">
                  Streak<span className="text-brand">Flow</span>
                </span>
              </div>
            </div>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => navigateTo(link.path)}
                  className={`relative px-4 py-2 rounded-xl text-[0.82rem] font-semibold flex items-center gap-2 cursor-pointer transition-all duration-300 ${
                    isActive(link.path)
                      ? 'text-brand'
                      : 'text-ink-mid hover:text-ink hover:bg-ink/[0.04]'
                  }`}
                  id={`nav-${link.label.toLowerCase()}`}
                >
                  {link.icon}
                  {link.label}

                  {/* Active indicator pill */}
                  {isActive(link.path) && (
                    <motion.div
                      className="absolute bottom-0 left-3 right-3 h-[2.5px] rounded-full bg-gradient-to-r from-sf-teal to-sf-teal-light"
                      layoutId="nav-active-pill"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Right side: ThemeToggle + Profile + Mobile hamburger */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle (always visible) */}
              <ThemeToggle />

              {/* Profile Dropdown (desktop) */}
              <div className="hidden md:block relative" ref={profileRef}>
                <button
                  onClick={toggleProfile}
                  className={`flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full cursor-pointer transition-all duration-300 ${
                    profileOpen
                      ? 'bg-brand/10'
                      : 'hover:bg-ink/[0.04]'
                  }`}
                  id="nav-profile-btn"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-sf-teal-light to-sf-teal flex items-center justify-center text-on-brand text-xs font-bold overflow-hidden shadow-[0_2px_8px_rgba(44,181,160,0.3)] shrink-0">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      userInitial
                    )}
                  </div>
                  <span className="text-[0.8rem] font-semibold text-ink max-w-[120px] truncate">
                    {user?.fullName || 'User'}
                  </span>
                  <motion.div
                    animate={{ rotate: profileOpen ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <ChevronDown size={13} className="text-ink-mid" />
                  </motion.div>
                </button>

                {/* Dropdown menu */}
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      className="absolute right-0 mt-2 w-56 bg-surface rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.14)] border border-line overflow-hidden z-50"
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                    >
                      {/* User info */}
                      <div className="px-4 py-3.5 border-b border-line">
                        <p className="text-[0.82rem] font-bold text-ink truncate">
                          {user?.fullName}
                        </p>
                        <p className="text-[0.72rem] text-ink-mute truncate mt-0.5">
                          {user?.email}
                        </p>
                      </div>

                      {/* Menu items */}
                      <div className="py-1.5">
                        <button
                          className="w-full px-4 py-2.5 flex items-center gap-3 text-[0.8rem] font-medium text-ink-mid hover:bg-well hover:text-ink cursor-pointer transition-colors duration-200"
                          onClick={() => navigateTo(ROUTES.PROFILE)}
                          id="nav-dropdown-profile"
                        >
                          <User size={15} />
                          Profile
                        </button>
                        <button
                          className="w-full px-4 py-2.5 flex items-center gap-3 text-[0.8rem] font-medium text-danger-text hover:bg-danger-soft hover:text-danger cursor-pointer transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={handleLogout}
                          disabled={isLoading}
                          id="nav-dropdown-logout"
                        >
                          {isLoading ? <Loader2 size={15} className="animate-spin" /> : <LogOut size={15} />}
                          {isLoading ? 'Signing out...' : 'Sign Out'}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile hamburger */}
              <button
                className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-ink hover:bg-ink/[0.04] cursor-pointer transition-colors duration-200"
                onClick={toggleMobile}
                id="nav-mobile-toggle"
              >
                <AnimatePresence mode="wait">
                  {mobileOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X size={20} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu size={20} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* ====== Mobile Drawer ====== */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/25 backdrop-blur-sm z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobile}
            />

            {/* Drawer */}
            <motion.div
              className="fixed top-0 right-0 bottom-0 w-[280px] bg-surface/95 backdrop-blur-2xl shadow-[-8px_0_40px_rgba(0,0,0,0.12)] z-50 flex flex-col md:hidden border-l border-line"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-line">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sf-teal-light to-sf-teal flex items-center justify-center text-on-brand text-sm font-bold overflow-hidden shadow-[0_2px_8px_rgba(44,181,160,0.3)] shrink-0">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      userInitial
                    )}
                  </div>
                  <div>
                    <p className="text-[0.85rem] font-bold text-ink truncate max-w-[160px]">
                      {user?.fullName || 'User'}
                    </p>
                    <p className="text-[0.7rem] text-ink-mute truncate max-w-[160px]">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <button
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-mid hover:bg-well cursor-pointer transition-colors"
                  onClick={closeMobile}
                >
                  <X size={17} />
                </button>
              </div>

              {/* Nav links */}
              <div className="flex-1 px-3 py-4 flex flex-col gap-1">
                {navLinks.map((link, index) => (
                  <motion.button
                    key={link.path}
                    onClick={() => navigateTo(link.path)}
                    className={`w-full px-4 py-3 rounded-xl text-[0.88rem] font-semibold flex items-center gap-3 cursor-pointer transition-all duration-300 ${
                      isActive(link.path)
                        ? 'text-brand bg-brand/8'
                        : 'text-ink-mid hover:text-ink hover:bg-well'
                    }`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.06 }}
                    id={`nav-mobile-${link.label.toLowerCase()}`}
                  >
                    {link.icon}
                    {link.label}
                    {isActive(link.path) && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-brand" />
                    )}
                  </motion.button>
                ))}

                {/* Profile Link */}
                <motion.button
                  onClick={() => navigateTo(ROUTES.PROFILE)}
                  className={`w-full px-4 py-3 rounded-xl text-[0.88rem] font-semibold flex items-center gap-3 cursor-pointer transition-all duration-300 ${
                    isActive(ROUTES.PROFILE)
                      ? 'text-brand bg-brand/8'
                      : 'text-ink-mid hover:text-ink hover:bg-well'
                  }`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: navLinks.length * 0.06 }}
                  id="nav-mobile-profile"
                >
                  <User size={17} />
                  Profile
                  {isActive(ROUTES.PROFILE) && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-brand" />
                  )}
                </motion.button>

                {/* Theme toggle row in mobile drawer */}
                <div className="px-4 py-3 flex items-center justify-between">
                  <span className="text-[0.88rem] font-semibold text-ink-mid">Theme</span>
                  <ThemeToggle />
                </div>
              </div>

              {/* Logout */}
              <div className="px-3 pb-6 pt-2 border-t border-line">
                <motion.button
                  className="w-full px-4 py-3 rounded-xl text-[0.88rem] font-semibold flex items-center gap-3 text-danger-text hover:bg-danger-soft hover:text-danger cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleLogout}
                  disabled={isLoading}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.25 }}
                  id="nav-mobile-logout"
                >
                  {isLoading ? <Loader2 size={17} className="animate-spin" /> : <LogOut size={17} />}
                  {isLoading ? 'Signing out...' : 'Sign Out'}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer to push content below the fixed navbar */}
      <div className="h-14 sm:h-[64px]" />
    </>
  )
})

Navbar.displayName = 'Navbar'

export default Navbar
