import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

export default createConfigForNuxt({
  features: {
    typescript: true,
  },
  dirs: {
    src: [
      './components',
      './composables', 
      './pages',
      './utils',
      './data'
    ]
  }
}).append({
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'prefer-const': 'error',
    'no-var': 'error',
    'vue/multi-word-component-names': 'off', // Disable for Nuxt pages
  }
}) 