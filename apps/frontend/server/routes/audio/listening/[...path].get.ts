import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { isAbsolute, resolve, sep } from 'node:path'
import {
  createError,
  defineEventHandler,
  getRequestHeader,
  getRouterParam,
  sendStream,
  setResponseHeader,
  setResponseStatus,
} from 'h3'

/**
 * Serve the listening WAVs from disk.
 *
 * Nitro bakes its public-asset manifest at build time, and `.dockerignore` excludes
 * `apps/frontend/public/audio`, so the manifest holds no `/audio/**` entries. The bundled
 * seeds (read-only bind mount) and the generated audio (shared named volume) are both
 * attached at *runtime*, which a build-time manifest can never know about — unknown paths
 * fall through to the SSR handler and answer with the SPA shell instead of audio. This
 * handler reads the filesystem per request, so runtime-mounted files are served.
 *
 * Range requests are handled here rather than through h3's `serveStatic`, which has no
 * range support: `AudioPlayer.vue` seeks by assigning `currentTime`, and a browser will
 * not seek into a response that did not advertise `Accept-Ranges`.
 */
const ROOT = resolve(process.cwd(), 'public/audio/listening')

/** Audio only: the seed directories also hold `.hash` sidecars that must stay private. */
const CONTENT_TYPES: Record<string, string> = {
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
}

/** Resolve inside ROOT or return null, so a crafted path cannot escape the directory. */
function containedPath(relative: string): string | null {
  if (!relative || isAbsolute(relative)) return null
  if (relative.split(/[/\\]/).some(part => part === '' || part === '.' || part === '..')) return null
  const absolute = resolve(ROOT, relative)
  return absolute.startsWith(ROOT + sep) ? absolute : null
}

/** Parse a single `bytes=` range. Multi-range is not worth supporting for a media file. */
function parseRange(header: string | undefined, size: number): { start: number; end: number } | null {
  const match = /^bytes=(\d*)-(\d*)$/.exec(header?.trim() ?? '')
  if (!match) return null
  const [, rawStart, rawEnd] = match
  if (!rawStart && !rawEnd) return null
  // A suffix range (`bytes=-500`) asks for the final N bytes.
  const start = rawStart ? Number(rawStart) : Math.max(0, size - Number(rawEnd))
  const end = rawStart && rawEnd ? Math.min(Number(rawEnd), size - 1) : size - 1
  return start > end || start >= size ? null : { start, end }
}

export default defineEventHandler(async event => {
  const relative = getRouterParam(event, 'path', { decode: true })
  const absolute = relative ? containedPath(relative) : null
  const match = Object.entries(CONTENT_TYPES).find(([extension]) => absolute?.endsWith(extension))
  if (!absolute || !match) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  const stats = await stat(absolute).catch(() => null)
  if (!stats?.isFile()) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  setResponseHeader(event, 'content-type', match[1])
  setResponseHeader(event, 'accept-ranges', 'bytes')
  setResponseHeader(event, 'cache-control', 'public, max-age=3600')

  const header = getRequestHeader(event, 'range')
  const range = parseRange(header, stats.size)
  if (header && !range) {
    setResponseHeader(event, 'content-range', `bytes */${stats.size}`)
    throw createError({ statusCode: 416, statusMessage: 'Range Not Satisfiable' })
  }

  if (!range) {
    setResponseHeader(event, 'content-length', stats.size)
    return sendStream(event, createReadStream(absolute))
  }

  setResponseStatus(event, 206)
  setResponseHeader(event, 'content-range', `bytes ${range.start}-${range.end}/${stats.size}`)
  setResponseHeader(event, 'content-length', range.end - range.start + 1)
  return sendStream(event, createReadStream(absolute, { start: range.start, end: range.end }))
})
