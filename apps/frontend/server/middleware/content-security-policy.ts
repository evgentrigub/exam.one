// The CSP must allow the API origin, which is a runtime setting (NUXT_PUBLIC_API_URL, e.g. a
// non-default BACKEND_PORT). Building the header in nuxt.config.ts froze the build-time origin
// into the image, so it is assembled per request from the runtime config instead.
function apiConnectSources(apiUrl: string): string {
  const api = new URL(apiUrl)
  const loopback = api.hostname === 'localhost' ? `${api.protocol}//127.0.0.1${api.port ? `:${api.port}` : ''}` : ''
  return [api.origin, loopback].filter(Boolean).join(' ')
}

export default defineEventHandler(event => {
  const { apiUrl } = useRuntimeConfig(event).public
  setResponseHeader(
    event,
    'Content-Security-Policy',
    `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; media-src 'self' blob:; connect-src 'self' ${apiConnectSources(apiUrl)}; frame-ancestors 'self';`
  )
})
