// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  
  // Modules
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt'
  ],

  // TypeScript configuration
  typescript: {
    strict: true,
    typeCheck: true
  },

  // CSS configuration
  css: ['~/assets/styles/main.css'],

  // Tailwind CSS configuration will be in tailwind.config.js

  // Pinia configuration will be in stores/

  // Build configuration
  build: {
    transpile: []
  },

  // Vite configuration for bundle optimization
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['vue', 'vue-router'],
            pinia: ['pinia']
          }
        }
      }
    }
  },

  // App configuration
  app: {
    head: {
      title: 'German Reading Trainer',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Practice German reading comprehension with authentic exam-style texts' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },

  // Security headers
  nitro: {
    routeRules: {
      '/**': {
        headers: {
          'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;"
        }
      }
    }
  }
})
