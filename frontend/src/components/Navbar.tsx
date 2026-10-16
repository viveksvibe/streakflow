import { useState, useEffect, useRef } from 'react'
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

import { useAuthStore } from '../store/authStore'
import { ROUTES } from '../constant'

interface NavLink {
  label: string
  path: string
  icon: React.ReactNode
}

const navLinks: NavLink[] = [
  { label: 'Home', path: ROUTES.HOME, icon: <Home size={18} /> },
  { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: <BarChart3 size={18} /> },
  { label: 'Streaks', path: ROUTES.STREAK, icon: <Flame size={18} /> },
]

const Navbar = () => {
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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
    setProfileOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    await logout()
    navigate(ROUTES.SIGNIN)
  }

  const isActive = (path: string) => location.pathname === path

  const userInitial = user?.fullName?.charAt(0)?.toUpperCase() || 'U'

  return (
    <>
      {/* ====== Desktop / Tablet Navbar ====== */}
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-white/80 shadow-[0_2px_24px_rgba(0,0,0,0.08)]'
            : 'bg-white/50 shadow-none'
        } backdrop-blur-xl`}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
        id="main-navbar"
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-[68px]">
            {/* Logo */}
            <div
              className="cursor-pointer shrink-0"
              onClick={() => navigate(ROUTES.HOME)}
            >
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-sf-teal to-sf-teal-dark flex items-center justify-center text-white shadow-[0_2px_10px_rgba(44,181,160,0.35)]">
                  <Flame size={20} strokeWidth={2.2} />
                </div>
                <span className="text-lg font-bold text-text-dark tracking-tight">
                  Streak<span className="text-sf-teal">Flow</span>
                </span>
              </div>
            </div>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={`relative px-4 py-2 rounded-xl text-[0.88rem] font-semibold flex items-center gap-2 cursor-pointer transition-all duration-300 ${
                    isActive(link.path)
                      ? 'text-sf-teal'
                      : 'text-text-dark-secondary hover:text-text-dark hover:bg-black/[0.04]'
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

            {/* Right side: Profile + Mobile hamburger */}
            <div className="flex items-center gap-2">
              {/* Profile Dropdown (desktop) */}
              <div className="hidden md:block relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className={`flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full cursor-pointer transition-all duration-300 ${
                    profileOpen
                      ? 'bg-sf-teal/10'
                      : 'hover:bg-black/[0.04]'
                  }`}
                  id="nav-profile-btn"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sf-teal-light to-sf-teal flex items-center justify-center text-white text-sm font-bold overflow-hidden shadow-[0_2px_8px_rgba(44,181,160,0.3)] shrink-0">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      userInitial
                    )}
                  </div>
                  <span className="text-[0.85rem] font-semibold text-text-dark max-w-[120px] truncate">
                    {user?.fullName || 'User'}
                  </span>
                  <motion.div
                    animate={{ rotate: profileOpen ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <ChevronDown size={14} className="text-text-dark-secondary" />
                  </motion.div>
                </button>

                {/* Dropdown menu */}
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-black/[0.06] overflow-hidden z-50"
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                    >
                      {/* User info */}
                      <div className="px-4 py-3.5 border-b border-black/[0.06]">
                        <p className="text-[0.88rem] font-bold text-text-dark truncate">
                          {user?.fullName}
                        </p>
                        <p className="text-[0.75rem] text-text-dark-secondary truncate mt-0.5">
                          {user?.email}
                        </p>
                      </div>

                      {/* Menu items */}
                      <div className="py-1.5">
                        <button
                          className="w-full px-4 py-2.5 flex items-center gap-3 text-[0.85rem] font-medium text-text-dark-secondary hover:bg-gray-50 hover:text-text-dark cursor-pointer transition-colors duration-200"
                          onClick={() => {
                            setProfileOpen(false)
                            navigate(ROUTES.PROFILE)
                          }}
                          id="nav-dropdown-profile"
                        >
                          <User size={16} />
                          Profile
                        </button>
                        <button
                          className={`w-full px-4 py-2.5 flex items-center gap-3 text-[0.85rem] font-medium text-red-400 hover:bg-red-50 hover:text-red-500 cursor-pointer transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                          onClick={handleLogout}
                          disabled={isLoading}
                          id="nav-dropdown-logout"
                        >
                          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
                          {isLoading ? 'Signing out...' : 'Sign Out'}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile hamburger */}
              <button
                className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center text-text-dark hover:bg-black/[0.04] cursor-pointer transition-colors duration-200"
                onClick={() => setMobileOpen(!mobileOpen)}
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
                      <X size={22} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu size={22} />
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
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              className="fixed top-0 right-0 bottom-0 w-[280px] bg-white/95 backdrop-blur-2xl shadow-[-8px_0_40px_rgba(0,0,0,0.1)] z-50 flex flex-col md:hidden"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-black/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sf-teal-light to-sf-teal flex items-center justify-center text-white text-lg font-bold overflow-hidden shadow-[0_2px_8px_rgba(44,181,160,0.3)] shrink-0">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      userInitial
                    )}
                  </div>
                  <div>
                    <p className="text-[0.9rem] font-bold text-text-dark truncate max-w-[160px]">
                      {user?.fullName || 'User'}
                    </p>
                    <p className="text-[0.72rem] text-text-dark-secondary truncate max-w-[160px]">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <button
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-text-dark-secondary hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Nav links */}
              <div className="flex-1 px-3 py-4 flex flex-col gap-1">
                {navLinks.map((link, index) => (
                  <motion.button
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    className={`w-full px-4 py-3 rounded-xl text-[0.92rem] font-semibold flex items-center gap-3 cursor-pointer transition-all duration-300 ${
                      isActive(link.path)
                        ? 'text-sf-teal bg-sf-teal/8'
                        : 'text-text-dark-secondary hover:text-text-dark hover:bg-gray-50'
                    }`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.06 }}
                    id={`nav-mobile-${link.label.toLowerCase()}`}
                  >
                    {link.icon}
                    {link.label}

                    {isActive(link.path) && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-sf-teal" />
                    )}
                  </motion.button>
                ))}
                
                {/* Profile Link (Mobile only) */}
                <motion.button
                  onClick={() => navigate(ROUTES.PROFILE)}
                  className={`w-full px-4 py-3 rounded-xl text-[0.92rem] font-semibold flex items-center gap-3 cursor-pointer transition-all duration-300 ${
                    isActive(ROUTES.PROFILE)
                      ? 'text-sf-teal bg-sf-teal/8'
                      : 'text-text-dark-secondary hover:text-text-dark hover:bg-gray-50'
                  }`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: navLinks.length * 0.06 }}
                  id="nav-mobile-profile"
                >
                  <User size={18} />
                  Profile
                  {isActive(ROUTES.PROFILE) && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-sf-teal" />
                  )}
                </motion.button>
              </div>

              {/* Logout */}
              <div className="px-3 pb-6 pt-2 border-t border-black/[0.06]">
                <motion.button
                  className={`w-full px-4 py-3 rounded-xl text-[0.92rem] font-semibold flex items-center gap-3 text-red-400 hover:bg-red-50 hover:text-red-500 cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                  onClick={handleLogout}
                  disabled={isLoading}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.25 }}
                  id="nav-mobile-logout"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} />}
                  {isLoading ? 'Signing out...' : 'Sign Out'}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer to push content below the fixed navbar */}
      <div className="h-16 sm:h-[68px]" />
    </>
  )
}

export default Navbar
