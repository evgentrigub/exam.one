import daisyui from 'daisyui'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue", 
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue"
  ],
  plugins: [
    daisyui
  ],
  daisyui: {
    themes: [
      {
        light: {
          "primary": "#00897B",        // Goethe brand teal
          "secondary": "#546E7A",      // Soft neutral
          "accent": "#26A69A",         // Teal accent
          "neutral": "#37474F",        // Dark gray
          "base-100": "#FFFFFF",       // White background
          "info": "#0288D1",
          "success": "#66BB6A",
          "warning": "#FFA726",
          "error": "#EF5350",
        },
        dark: {
          "primary": "#26A69A",        // Lighter teal for dark mode
          "secondary": "#78909C",      // Lighter neutral
          "accent": "#4DB6AC",         // Bright teal accent
          "neutral": "#263238",        // Dark background
          "base-100": "#1E1E1E",       // Dark background
          "info": "#29B6F6",
          "success": "#66BB6A",
          "warning": "#FFA726",
          "error": "#EF5350",
        },
      },
    ],
  },
} 