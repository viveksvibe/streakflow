import { useCallback, useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'sf-theme'

function subscribe(callback: () => void) {
  window.addEventListener('sf-theme-change', callback)
  return () => window.removeEventListener('sf-theme-change', callback)
}

function getSnapshot(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

function getServerSnapshot(): Theme {
  return 'light'
}

/** Reads the theme from <html> so every hook instance stays in sync. */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const setTheme = useCallback((next: Theme) => {
    const root = document.documentElement
    const animating =
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (animating) {
      root.classList.add('theme-transitioning')
      window.setTimeout(() => root.classList.remove('theme-transitioning'), 500)
    }

    root.classList.toggle('dark', next === 'dark')
    root.style.colorScheme = next

    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Private mode etc. — theme still applies for the session.
    }

    window.dispatchEvent(new Event('sf-theme-change'))
  }, [])

  /** Toggles light <-> dark, whatever the current mode is. */
  const toggleTheme = useCallback(() => {
    setTheme(getSnapshot() === 'dark' ? 'light' : 'dark')
  }, [setTheme])

  return { theme, setTheme, toggleTheme }
}

/** Applies the stored theme before first paint. Default: light. */
export function initTheme() {
  let stored: string | null = null
  try {
    stored = localStorage.getItem(STORAGE_KEY)
  } catch {
    // Private mode etc. — fall back to the default below.
  }
  const theme = stored === 'dark' ? 'dark' : 'light' // default: light
  document.documentElement.classList.toggle('dark', theme === 'dark')
  document.documentElement.style.colorScheme = theme
}
