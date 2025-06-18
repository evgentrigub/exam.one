// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Disable server-side rendering - we are building a pure client-side PWA
  ssr: false,

  devtools: { enabled: true },

  /*
   * Lightweight module set required for the Goethe A2 Reading Simulator.
   * - @nuxt/ui: polished default components (tailwind-powered)
   * - @nuxt/image: responsive image optimisation
   * - @nuxt/icon: inline SVG icons
   * - @pinia/nuxt: state-management (persisted later)
   */
  modules: [
    '@nuxt/ui',
    '@nuxt/image',
    '@nuxt/icon',
    '@pinia/nuxt'
  ]
})