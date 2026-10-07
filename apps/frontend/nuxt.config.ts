// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2026-08-18',
  devtools: { enabled: true },

  // Explicit so startup logs and docs can point at a stable URL
  devServer: {
    host: 'localhost',
    port: 3000,
  },

  hooks: {
    listen(_server, listener) {
      const fromListener =
        listener && typeof listener === 'object'
          ? (listener as { url?: string; address?: string | (() => string) })
          : null
      const url =
        fromListener?.url ||
        (typeof fromListener?.address === 'string' ? fromListener.address : undefined) ||
        'http://localhost:3000'
      console.info(`[exam.one] Frontend ready at ${url}`)
    },
  },

  // Modules
  modules: ['@pinia/nuxt', '@vueuse/nuxt', '@nuxtjs/i18n'],

  // i18n configuration
  i18n: {
    locales: [
      { code: 'de', language: 'de-DE', name: 'Deutsch', file: 'de.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
      { code: 'es', language: 'es-ES', name: 'Español', file: 'es.json' },
      { code: 'pl', language: 'pl-PL', name: 'Polski', file: 'pl.json' },
      { code: 'ru', language: 'ru-RU', name: 'Русский', file: 'ru.json' },
    ],
    defaultLocale: 'en',
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'exam-one:locale',
      redirectOn: 'root',
    },
    langDir: 'locales',
    // lazy: true
  },

  // TypeScript configuration
  typescript: {
    strict: true,
    typeCheck: true,
  },

  // CSS configuration
  css: ['~/assets/styles/main.css'],

  // Components configuration
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  // Pinia configuration will be in stores/

  // Build configuration
  build: {
    transpile: [],
  },

  // Vite configuration
  vite: {
    plugins: [tailwindcss()],
  },

  // App configuration
  app: {
    head: {
      title: 'Exam.one',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Prepare to exams by practicing reading, writing, listening and speaking with authentic exam-style texts',
        },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap',
        },
      ],
    },
  },

  // Hybrid rendering: auth screens are SSR'd; the login-gated app is client-only.
  // Session cookies live on the API host, so Nuxt cannot know the user during SSR.
  // The Content-Security-Policy header is set per request in server/middleware/.
  routeRules: {
    '/auth/**': { ssr: true },
    '/**': { ssr: false },
  },

  runtimeConfig: {
    public: {
      frontendLandingUrl: process.env['FRONTEND_LANDING_URL'] || 'http://localhost:3001',
      apiUrl: process.env['NUXT_PUBLIC_API_URL'] || 'http://localhost:3001',
    },
  },
})
