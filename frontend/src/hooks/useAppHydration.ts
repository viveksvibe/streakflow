import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useHabitStore } from '../store/habitStore'
import { useStatStore } from '../store/statStore'
import { useHabitReminders } from './useHabitReminders'

export function useAppHydration() {
  const { getCurrentUser, hydrateAuth } = useAuthStore()
  const [appReady, setAppReady] = useState(false)

  useHabitReminders()

  useEffect(() => {
    hydrateAuth()
    if (localStorage.getItem("accessToken")) {
      // Prefetch data if user is authenticated
      useStatStore.getState().getDashboardStats()
      useHabitStore.getState().getHabits()
      getCurrentUser().finally(() => {
        setAppReady(true)
      })
    } else {
      getCurrentUser().finally(() => {
        setAppReady(true)
      })
    }
  }, [getCurrentUser, hydrateAuth])

  return appReady
}
