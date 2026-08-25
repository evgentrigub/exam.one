function safeAppPath(value: unknown): string {
  if (typeof value !== 'string') return '/dashboard'
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/auth')) {
    return '/dashboard'
  }
  return value
}

async function applyAuthGate(to: {
  path: string
  fullPath: string
  query: { [key: string]: unknown }
}) {
  const isAuthRoute = to.path.startsWith('/auth')
  const { ensureSession, user } = useAuth()

  if (isAuthRoute) {
    const session = await ensureSession()
    const stayOnAuth =
      to.path === '/auth/verify' || to.path === '/auth/reset' || to.path === '/auth/welcome'
    if (session && !stayOnAuth) {
      return navigateTo(safeAppPath(to.query['redirect']))
    }
    if (!session && to.path === '/auth/welcome') {
      return navigateTo('/auth/login')
    }
    return
  }

  const session = await ensureSession()
  if (!session && !user.value) {
    return navigateTo({
      path: '/auth/login',
      query: { redirect: to.fullPath },
    })
  }
}

export default defineNuxtRouteMiddleware(async to => {
  // Gated pages are client-only (routeRules ssr: false). Auth pages SSR as-is.
  if (import.meta.server) return

  const nuxtApp = useNuxtApp()
  // Do not change layout during hydration of an SSR'd auth page.
  if (nuxtApp.isHydrating && nuxtApp.payload.serverRendered) {
    nuxtApp.hooks.hookOnce('app:mounted', () => {
      void applyAuthGate(useRoute())
    })
    return
  }

  return applyAuthGate(to)
})
