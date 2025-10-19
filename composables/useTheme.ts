/**
 * Theme Composable
 * Manages daisyUI theme switching and persistence
 */

export type Theme = 
  | 'light' 
  | 'dark' 
  | 'bumblebee' 
  | 'cyberpunk' 
  | 'synthwave' 
  | 'retro' 
  | 'valentine'
  | 'aqua'
  | 'lofi'
  | 'pastel'
  | 'fantasy'
  | 'luxury'
  | 'dracula'
  | 'autumn'
  | 'business'
  | 'night'
  | 'coffee'
  | 'winter'

export const LIGHT_THEMES: { value: Theme; label: string; icon: string }[] = [
//   { value: 'light', label: 'Light', icon: '☀️' },
  { value: 'bumblebee', label: 'Bumblebee', icon: '🐝' },
//   { value: 'retro', label: 'Retro', icon: '📻' },
//   { value: 'valentine', label: 'Valentine', icon: '💖' },
//   { value: 'aqua', label: 'Aqua', icon: '🌊' },
//   { value: 'lofi', label: 'Lo-Fi', icon: '🎧' },
//   { value: 'pastel', label: 'Pastel', icon: '🎨' },
//   { value: 'fantasy', label: 'Fantasy', icon: '🦄' },
//   { value: 'autumn', label: 'Autumn', icon: '🍂' },
  { value: 'winter', label: 'Winter', icon: '❄️' },
]

export const DARK_THEMES: { value: Theme; label: string; icon: string }[] = [
  { value: 'dark', label: 'Dark', icon: '🌙' },
  { value: 'cyberpunk', label: 'Cyberpunk', icon: '🌆' },
  { value: 'synthwave', label: 'Synthwave', icon: '🌃' },
  { value: 'luxury', label: 'Luxury', icon: '💎' },
  { value: 'dracula', label: 'Dracula', icon: '🧛' },
  { value: 'business', label: 'Business', icon: '💼' },
  { value: 'night', label: 'Night', icon: '🌌' },
  { value: 'coffee', label: 'Coffee', icon: '☕' },
]

export const AVAILABLE_THEMES = [...LIGHT_THEMES, ...DARK_THEMES]

export const useTheme = () => {
  const theme = useState<Theme>('theme', () => 'bumblebee')
  
  /**
   * Set a new theme
   */
  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme
    
    if (import.meta.client) {
      // Apply to DOM
      document.documentElement.setAttribute('data-theme', newTheme)
      
      // Persist to localStorage
      localStorage.setItem('theme', newTheme)
    }
  }
  
  /**
   * Initialize theme from localStorage or default
   */
  const initTheme = () => {
    if (import.meta.client) {
      const savedTheme = localStorage.getItem('theme') as Theme
      const defaultTheme = savedTheme || 'bumblebee'
      setTheme(defaultTheme)
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
    darkThemes: DARK_THEMES
  }
}

