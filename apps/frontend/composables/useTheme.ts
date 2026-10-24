/**
 * Theme Composable
 * Manages daisyUI theme switching and persistence
 */

const STORAGE_KEY = 'exam-one:theme'

export type Theme = 'light' | 'dark'

export const LIGHT_THEMES: { value: Theme; label: string; icon: string }[] = [
  { value: 'light', label: 'Light', icon: '☀️' },
]

export const DARK_THEMES: { value: Theme; label: string; icon: string }[] = [
  { value: 'dark', label: 'Dark', icon: '🌙' },
]

export const AVAILABLE_THEMES = [...LIGHT_THEMES, ...DARK_THEMES]

const isValidTheme = (value: string | null): value is Theme =>
  AVAILABLE_THEMES.some(t => t.value === value)

export const useTheme = () => {
  const theme = useState<Theme>('theme', () => 'light')

  /**
   * Set a new theme
   */
  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme

    if (import.meta.client) {
      // Apply to DOM
      document.documentElement.setAttribute('data-theme', newTheme)

      // Persist to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, newTheme)
      } catch (error) {
        console.error(`[${STORAGE_KEY}] write failed`, error)
      }
    }
  }

  /**
   * Initialize theme from localStorage or default
   */
  const initTheme = () => {
    if (import.meta.client) {
      try {
        const savedTheme = localStorage.getItem(STORAGE_KEY)
        const defaultTheme: Theme = isValidTheme(savedTheme) ? savedTheme : 'light'
        setTheme(defaultTheme)
      } catch (error) {
        console.error(`[${STORAGE_KEY}] read failed`, error)
        setTheme('light')
      }
    }
  }

  /**
   * Get current theme label
   */
  const currentThemeLabel = computed(() => {
    return AVAILABLE_THEMES.find(t => t.value === theme.value)?.label || 'Theme'
  })

  /**
   * Get current theme icon
   */
  const currentThemeIcon = computed(() => {
    return AVAILABLE_THEMES.find(t => t.value === theme.value)?.icon || '🎨'
  })

  return {
    theme: readonly(theme),
    setTheme,
    initTheme,
    currentThemeLabel,
    currentThemeIcon,
    availableThemes: AVAILABLE_THEMES,
    lightThemes: LIGHT_THEMES,
    darkThemes: DARK_THEMES,
  }
}
