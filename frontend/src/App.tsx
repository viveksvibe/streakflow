import { Routes, Route, Navigate } from 'react-router-dom'
import WelcomePage from './pages/WelcomePage'
import SignUpPage from './pages/SignUpPage'
import SignInPage from './pages/SignInPage'
import HomePage from './pages/HomePage'
import StreakPage from './pages/StreakPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import PublicRoute from './routes/PublicRoutes'
import ProtectedRoute from './routes/ProtectedRoutes'
import { useAuthStore } from './store/authStore'
import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import Loader from './components/Loader'
import { Toaster } from 'react-hot-toast'


import { useHabitStore } from './store/habitStore'
import { useStatStore } from './store/statStore'
import { useHabitReminders } from './hooks/useHabitReminders'

function App() {
  const {getCurrentUser,hydrateAuth} = useAuthStore();
  const [appReady, setAppReady] = useState(false)

  useHabitReminders();

  useEffect(() => {
    hydrateAuth();
    if (localStorage.getItem("accessToken")) {
      useStatStore.getState().getDashboardStats();
      useHabitStore.getState().getHabits();
      getCurrentUser().finally(() => {
        setAppReady(true);
      });
    } else {
      getCurrentUser().finally(() => {
        setAppReady(true);
      });
    }
  }, [getCurrentUser]);



  return (
    <>
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: 'white',
            color: 'black',
            borderRadius: '12px',
            fontSize: '0.92rem',
            fontWeight: 500,
            border: '1px solid rgba(255, 255, 255, 0.1)',
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
        <Routes>
          <Route element={<PublicRoute/>}>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/signin" element={<SignInPage />} />
          </Route>


          <Route element={<ProtectedRoute/>}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/streak" element={<StreakPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      )}
    </>
  )
}

export default App

