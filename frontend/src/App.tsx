import { Routes, Route } from 'react-router-dom'
import WelcomePage from './pages/WelcomePage'
import SignUpPage from './pages/SignUpPage'
import SignInPage from './pages/SignInPage'
import HomePage from './pages/HomePage'
import StreakPage from './pages/StreakPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import NotFoundPage from './pages/NotFoundPage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import { CookieConsent } from './components/common/CookieConsent'
import PublicRoute from './routes/PublicRoutes'
import ProtectedRoute from './routes/ProtectedRoutes'
import { AnimatePresence } from 'framer-motion'
import Loader from './components/common/Loader'
import { Toaster } from 'react-hot-toast'
import { useAppHydration } from './hooks/useAppHydration'

function App() {
  const appReady = useAppHydration()

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'var(--sf-surface)',
            color: 'var(--sf-text)',
            borderRadius: '12px',
            fontSize: '0.92rem',
            fontWeight: 500,
            border: '1px solid var(--sf-line)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
          },
          success: {
            iconTheme: {
              primary: '#2cb5a0',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#d4736e',
              secondary: '#fff',
            },
          },
        }}
      />
      {/* Fullscreen splash loader during initial hydration */}
      <AnimatePresence>
        {!appReady && <Loader message="Getting things ready" />}
      </AnimatePresence>

      {appReady && (
        <>
          <Routes>
            <Route element={<PublicRoute/>}>
              <Route path="/" element={<WelcomePage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/signin" element={<SignInPage />} />
            </Route>

            {/* AUDIT FIX [9.2]: Legal Routes */}
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />

            <Route element={<ProtectedRoute/>}>
              <Route path="/home" element={<HomePage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/streak" element={<StreakPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* AUDIT FIX [10.1]: Dedicated 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>

          {/* AUDIT FIX [9.1]: Cookie Consent Banner */}
          <CookieConsent />
        </>
      )}
    </>
  )
}

export default App

