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
          "primary": "oklch(0.623 0.214 259.815)",      // Rich blue-purple (from previous theme)
          "primary-content": "oklch(0.97 0.014 254.604)", // Light primary text
          "secondary": "oklch(0.715 0.143 215.221)",    // Cyan-blue (from previous theme)
          "secondary-content": "oklch(0.977 0.013 236.62)", // Light secondary text
          "accent": "#00897B",                           // Goethe brand teal (keeping this)
          "neutral": "#37474F",                          // Dark gray
          "neutral-content": "#FFFFFF",                  // White text on neutral
          "base-100": "#FFFFFF",                         // White background
          "base-200": "#F8F9FA",                         // Slightly darker white
          "base-300": "#E9ECEF",                         // Even darker white
          "base-content": "#1F2937",                     // Dark text
          "info": "#0288D1",
          "success": "oklch(0.715 0.143 158.3)",        // Green (from previous theme)
          "success-content": "oklch(0.977 0.013 158.1)", // Light green text
          "warning": "oklch(0.715 0.143 80.3)",         // Orange/yellow (from previous theme)
          "warning-content": "oklch(0.977 0.013 80.1)", // Light warning text
          "error": "oklch(0.637 0.237 25.331)",         // Red (from previous theme)
          "error-content": "oklch(0.977 0.013 17.38)",  // Light error text
        },
        dark: {
          "primary": "oklch(0.546 0.245 262.881)",      // Darker blue-purple for dark mode
          "primary-content": "oklch(0.932 0.032 255.585)", // Bright primary text
          "secondary": "oklch(0.609 0.126 221.723)",    // Darker cyan for dark mode
          "secondary-content": "oklch(0.951 0.026 236.824)", // Bright secondary text
          "accent": "#26A69A",                           // Lighter teal for dark mode
          "neutral": "#263238",                          // Dark background
          "neutral-content": "#ECEFF1",                  // Light text on neutral
          "base-100": "#1E1E1E",                         // Dark background
          "base-200": "#2D2D2D",                         // Slightly lighter dark
          "base-300": "#3D3D3D",                         // Even lighter dark
          "base-content": "#E5E7EB",                     // Light text
          "info": "#29B6F6",
          "success": "oklch(0.609 0.126 158.4)",        // Darker green for dark mode
          "success-content": "oklch(0.951 0.026 158.2)", // Bright green text
          "warning": "oklch(0.609 0.126 80.4)",         // Darker orange for dark mode
          "warning-content": "oklch(0.951 0.026 80.2)", // Bright warning text
          "error": "oklch(0.577 0.245 27.325)",         // Darker red for dark mode
          "error-content": "oklch(0.951 0.026 17.717)", // Bright error text
        },
      },
    ],
  },
} 