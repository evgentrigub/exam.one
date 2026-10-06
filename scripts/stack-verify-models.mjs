#!/usr/bin/env node
/**
 * Fail fast when Compose speech mounts would be empty.
 * Run after `pnpm stack:setup`.
 */
import { access, readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

/** The TTS languages `pnpm tts:setup` downloads, as the download script reads them. */
const languages = new Set(
  (process.env.KOKORO_LANGS ?? 'en')
    .split(',')
    .map(lang => lang.trim().toLowerCase())
    .filter(Boolean)
)

/** Every file the selected languages' voices need, from the shared voice manifest. */
async function ttsFiles() {
  const manifestPath = path.join(repoRoot, 'scripts/tts/victoria/voice-manifest.json')
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
  const keys = new Set(
    manifest.voices
      .filter(voice => languages.has(voice.lang))
      .flatMap(voice => [voice.model, voice.voice, ...(voice.shared ?? [])])
  )
  return [...keys].map(key => `scripts/tts/victoria/models/${manifest.files[key].path}`)
}

async function main() {
  const required = [...(await ttsFiles()), 'scripts/stt/parakeet/models/parakeet-tdt-0.6b-v3-Q8_0.gguf']
  const missing = []
  for (const relative of required) {
    const absolute = path.join(repoRoot, relative)
    try {
      await access(absolute)
      const info = await stat(absolute)
      if (!info.isFile() || info.size < 1000) {
        missing.push(`${relative} (too small)`)
      }
    } catch {
      missing.push(relative)
    }
  }

  if (missing.length > 0) {
    console.error('[stack:verify-models] Speech model files are missing:')
    for (const item of missing) {
      console.error(`  - ${item}`)
    }
    console.error('Run `pnpm stack:setup` first so Compose does not mount empty model directories.')
    process.exit(1)
  }

  console.log('[stack:verify-models] TTS and STT model snapshots are present.')
}

main().catch(error => {
  console.error('[stack:verify-models] failed', error)
  process.exit(1)
})
