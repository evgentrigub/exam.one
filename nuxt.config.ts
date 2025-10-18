// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  
  // Modules
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/i18n'
  ],

    // i18n configuration
  i18n: {
    locales: [
      { code: 'de', iso: 'de-DE', name: 'Deutsch', file: 'de.json' },
      { code: 'en', iso: 'en-US', name: 'English', file: 'en.json' }
    ],
    defaultLocale: 'en',
    strategy: 'no_prefix',
    // detectBrowserLanguage: {
    //   useCookie: true,
    //   cookieKey: 'i18n_redirected',
    //   redirectOn: 'root'
    // },
    langDir: 'locales',
    // lazy: true
  },

  // TypeScript configuration
  typescript: {
    strict: true,
    typeCheck: true
  },

  // CSS configuration
  css: ['~/assets/styles/main.css'],

  // Components configuration
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    }
  ],

  // Tailwind CSS configuration
  tailwindcss: {
    configPath: '~/tailwind.config.js',
    exposeConfig: true,
    config: {},
    viewer: true,
  },

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
      title: 'Exam.one',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Prepare to exams by practicing reading, writing, listening and speaking with authentic exam-style texts' }
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
  },

  runtimeConfig: {
    // Private (server-only). You can also override at runtime with env var NUXT_OPENAI_API_KEY
    openaiApiKey: process.env['OPENAI_API_KEY'] || '',
    // Public (exposed to client). Leave empty unless you explicitly want to expose something.
    public: {}
  }
})
