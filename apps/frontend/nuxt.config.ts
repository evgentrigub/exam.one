// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
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
      { code: 'de', iso: 'de-DE', name: 'Deutsch', file: 'de.json' },
      { code: 'en', iso: 'en-US', name: 'English', file: 'en.json' },
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

  // Vite configuration for bundle optimization
  vite: {
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['vue', 'vue-router'],
            pinia: ['pinia'],
          },
        },
      },
    },
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

  // Security headers
  nitro: {
    routeRules: {
      '/**': {
        headers: {
          'Content-Security-Policy':
            "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:;",
        },
      },
    },
  },

  runtimeConfig: {
    // Private (server-only). Defaults come from the monorepo-root `.env` via `nuxt --dotenv ../../.env`.
    // Also overridable at runtime with NUXT_LLM_PROVIDER, NUXT_LLM_OPENAI_API_KEY, etc.
    // getLlmConfig() additionally falls back to OPENAI_API_KEY / OPENROUTER_API_KEY process env.
    llmProvider: process.env['LLM_PROVIDER'] || 'openrouter',
    llmOpenaiApiKey: process.env['OPENAI_API_KEY'] || '',
    llmOpenrouterApiKey: process.env['OPENROUTER_API_KEY'] || '',
    llmOpenaiModel: process.env['OPENAI_MODEL'] || 'gpt-5.5',
    llmOpenrouterModel: process.env['OPENROUTER_MODEL'] || 'google/gemma-4-26b-a4b-it:free',
    llmReasoningEffort: process.env['LLM_REASONING_EFFORT'] || 'medium',
    sttProvider: process.env['STT_PROVIDER'] || 'local',
    sttBaseUrl: process.env['STT_BASE_URL'] || 'http://127.0.0.1:8882',
    sttModel: process.env['STT_MODEL'] || 'nvidia/parakeet-tdt-0.6b-v3',
    sttOpenaiModel: process.env['STT_OPENAI_MODEL'] || 'whisper-1',
    sttOpenaiApiKey: process.env['OPENAI_API_KEY'] || '',
    // Public (exposed to client). Leave empty unless you explicitly want to expose something.
    public: {},
  },
})
