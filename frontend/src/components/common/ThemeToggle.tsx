import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme()
  const next = theme === 'dark' ? 'light' : 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${next} theme`}
      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-line text-ink-mute transition-colors duration-200 hover:text-ink hover:bg-well focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
    >
      {theme === 'dark' ? (
        <Sun size={17} strokeWidth={2.2} aria-hidden="true" />
      ) : (
        <Moon size={17} strokeWidth={2.2} aria-hidden="true" />
      )}
    </button>
  )
}

export default ThemeToggle
