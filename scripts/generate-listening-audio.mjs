#!/usr/bin/env node
/**
 * Pre-generate Kokoro WAV files for the bundled listening seeds of every exam pack.
 *
 * A seed is bundled when it carries an explicit `audio` map whose URLs sit under its pack's
 * `speech.audioPathPrefix` (Goethe A2: every seed; Goethe A1: the mock Set 1). Each URL is
 * written to `apps/frontend/public<url>`. Seeds without a map generate on demand instead.
 *
 * Prerequisites:
 *   1. bash scripts/tts/victoria/download-models.sh  (or ./scripts/tts/setup-kokoro.sh)
 *   2. pnpm tts:up
 *
 * Usage (from repo root):
 *   pnpm generate:listening-audio
 *   FORCE=1 pnpm generate:listening-audio   # after voice-roster / pipeline changes
 *
 * Env:
 *   TTS_BASE_URL           (default http://127.0.0.1:8881) — four-voice PyTorch
 *   TTS_CONCURRENCY        (default 3) — parallel segment synthesis
 *   TTS_SPEED              (default 1.0)
 *   TTS_TURN_PAUSE_MS      (default 350)
 *   FORCE=1                regenerate even when transcript hash matches
 *
 * Each pack is synthesised in its own `speech.ttsLang` with its own voices; a pack whose
 * voices the server does not serve is skipped with a warning. Dialogue transcripts with
 * Role: labels are synthesized turn-by-turn and concatenated. German monologues stay Martin.
 */

import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile, access } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createJiti } from 'jiti'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const publicRoot = path.join(repoRoot, 'apps/frontend/public')
const backendTtsRoot = path.join(repoRoot, 'apps/backend/src/speech/tts')

const jiti = createJiti(import.meta.url)

const { listPacks } = await jiti.import(path.join(repoRoot, 'data/src/index.ts'))

const ttsModule = await jiti.import(path.join(backendTtsRoot, 'tts.adapter.ts'))
const {
  synthesizeListeningTranscript,
  ttsHealthStatus,
  getTtsConfigFromEnv,
  listeningTranscriptHashKey,
} = ttsModule

const mapPoolModule = await jiti.import(path.join(backendTtsRoot, 'mapPool.ts'))
const { mapPool, getTtsConcurrency } = mapPoolModule

function hashTranscript(text, config) {
  return createHash('sha256').update(listeningTranscriptHashKey(text, config)).digest('hex')
}

/** The env TTS settings in a pack's own language and voices. */
function packTtsConfig(base, pack) {
  return {
    ...base,
    lang: pack.speech.ttsLang,
    voice: pack.speech.voices[0]?.id ?? base.voice,
    voices: pack.speech.voices,
  }
}

/** Every bundled seed WAV of every pack, one segment per URL, deduplicated by URL. */
export function collectSegments(packs = listPacks()) {
  const segments = new Map()

  for (const pack of packs) {
    const prefix = pack.speech.audioPathPrefix.replace(/\/$/, '') + '/'
    for (const exercise of pack.seedExercises?.listening ?? []) {
      const audio = exercise.audio
      if (!audio || typeof audio !== 'object') continue
      const add = (url, transcript) => {
        if (typeof url !== 'string' || !url.startsWith(prefix) || !transcript?.trim()) return
        if (!segments.has(url)) segments.set(url, { url, transcript, pack })
      }
      if (audio.shared) add(audio.shared, exercise.transcript)
      for (const [itemId, url] of Object.entries(audio.items ?? {})) {
        add(url, (exercise.items ?? []).find(item => item.id === itemId)?.transcript)
      }
    }
  }

  return [...segments.values()].map(segment => ({
    relativePath: segment.url.replace(/^\//, ''),
    transcript: segment.transcript,
    pack: segment.pack,
  }))
}

/** The public directory of every pack that ships bundled seed WAVs. */
export function bundledAudioDirs(packs = listPacks()) {
  const dirs = new Set()
  for (const segment of collectSegments(packs)) {
    dirs.add(path.join(publicRoot, path.dirname(path.dirname(segment.relativePath))))
  }
  return [...dirs]
}

async function fileExists(filePath) {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

function formatDuration(ms) {
  if (ms < 1000) return `${Math.round(ms)}ms`
  const seconds = ms / 1000
  if (seconds < 60) return `${seconds.toFixed(1)}s`
  const minutes = Math.floor(seconds / 60)
  const rem = seconds - minutes * 60
  return `${minutes}m ${rem.toFixed(1)}s`
}

async function main() {
  const force = process.env.FORCE === '1' || process.env.FORCE === 'true'
  const config = getTtsConfigFromEnv()
  const concurrency = getTtsConcurrency()
  const runStartedAt = Date.now()

  console.log(`[generate-listening-audio] TTS: ${config.baseUrl}`)
  console.log(`[generate-listening-audio] concurrency: ${concurrency}`)

  const healthy = (await ttsHealthStatus(config)) !== 'offline'
  if (!healthy) {
    console.error(
      '[generate-listening-audio] Kokoro TTS is not reachable.\n' +
        '  1. Run: bash scripts/tts/victoria/download-models.sh\n' +
        '  2. Run: pnpm tts:up\n' +
        '  3. Re-run: pnpm generate:listening-audio'
    )
    process.exit(1)
  }

  const segments = collectSegments()
  console.log(`[generate-listening-audio] ${segments.length} segment(s) to consider`)

  const work = []
  let skipped = 0
  const packConfigs = new Map()

  for (const segment of segments) {
    if (!packConfigs.has(segment.pack.packId)) {
      const packConfig = packTtsConfig(config, segment.pack)
      const status = await ttsHealthStatus(packConfig)
      if (status !== 'ok')
        console.warn(
          `[generate-listening-audio] skipping ${segment.pack.packId}: the server does not serve its ${packConfig.lang} voices`
        )
      packConfigs.set(segment.pack.packId, status === 'ok' ? packConfig : null)
    }
    const packConfig = packConfigs.get(segment.pack.packId)
    if (!packConfig) continue

    const outPath = path.join(publicRoot, segment.relativePath)
    const hashPath = `${outPath}.hash`
    const nextHash = hashTranscript(segment.transcript, packConfig)

    await mkdir(path.dirname(outPath), { recursive: true })

    if (!force && (await fileExists(outPath)) && (await fileExists(hashPath))) {
      const prevHash = (await readFile(hashPath, 'utf8')).trim()
      if (prevHash === nextHash) {
        console.log(`  skip  ${segment.relativePath}`)
        skipped += 1
        continue
      }
    }

    work.push({ segment, outPath, hashPath, nextHash, packConfig })
  }

  console.log(`[generate-listening-audio] ${work.length} segment(s) to synthesize`)
  const synthStartedAt = Date.now()
  console.log(
    `[generate-listening-audio] synthesis started at ${new Date(synthStartedAt).toISOString()}`
  )

  const errors = []
  let written = 0

  await mapPool(work, concurrency, async job => {
    const { segment, outPath, hashPath, nextHash, packConfig } = job
    const fileStartedAt = Date.now()
    console.log(`  start ${segment.relativePath}`)
    try {
      const audio = await synthesizeListeningTranscript(segment.transcript, packConfig)
      await writeFile(outPath, audio)
      await writeFile(hashPath, `${nextHash}\n`, 'utf8')
      written += 1
      const elapsed = Date.now() - fileStartedAt
      console.log(`  done  ${segment.relativePath} (${formatDuration(elapsed)})`)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      const elapsed = Date.now() - fileStartedAt
      console.error(`  fail  ${segment.relativePath} after ${formatDuration(elapsed)}: ${message}`)
      errors.push({ path: segment.relativePath, message })
    }
  })

  const synthElapsed = Date.now() - synthStartedAt
  const totalElapsed = Date.now() - runStartedAt
  console.log(
    `[generate-listening-audio] synthesis finished at ${new Date().toISOString()} ` +
      `(${formatDuration(synthElapsed)})`
  )
  console.log(
    `[generate-listening-audio] done — wrote ${written}, skipped ${skipped}, failed ${errors.length} ` +
      `(total ${formatDuration(totalElapsed)})`
  )

  if (errors.length > 0) {
    process.exit(1)
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    console.error('[generate-listening-audio] failed', error)
    process.exit(1)
  })
}
