import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { CookieConsent } from './components/common/CookieConsent'
import PublicRoute from './routes/PublicRoutes'
import ProtectedRoute from './routes/ProtectedRoutes'
import { AnimatePresence } from 'framer-motion'
import Loader from './components/common/Loader'
import { Toaster } from 'react-hot-toast'
import { useAppHydration } from './hooks/useAppHydration'

const WelcomePage = lazy(() => import('./pages/WelcomePage'))
const SignUpPage = lazy(() => import('./pages/SignUpPage'))
const SignInPage = lazy(() => import('./pages/SignInPage'))
const HomePage = lazy(() => import('./pages/HomePage'))
const StreakPage = lazy(() => import('./pages/StreakPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))
const TermsPage = lazy(() => import('./pages/TermsPage'))

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
            fontSize: '0.85rem',
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
          <Suspense fallback={<Loader message="Loading page..." />}>
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
          </Suspense>

          {/* AUDIT FIX [9.1]: Cookie Consent Banner */}
          <CookieConsent />
        </>
      )}
    </>
  )
}

export default App

