#!/usr/bin/env node
/**
 * Fail fast when Compose speech mounts would be empty.
 * Run after `pnpm stack:setup`.
 */
import { access, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

/** The TTS languages to check, as the download script and the TTS service read them. */
const languages = new Set(
  (process.env.KOKORO_LANGS ?? 'de,en,pl')
    .split(',')
    .map(lang => lang.trim())
    .filter(Boolean)
)

const required = [
  ...(languages.has('de')
    ? [
        'scripts/tts/victoria/models/kikiri_german_martin_ep10.pth',
        'scripts/tts/victoria/models/kikiri_german_victoria_ep10.pth',
        'scripts/tts/victoria/models/kikiri_german_base_51spk_ep4.pth',
        'scripts/tts/victoria/models/voices/martin.pt',
        'scripts/tts/victoria/models/voices/victoria.pt',
        'scripts/tts/victoria/models/voices/bernd.pt',
        'scripts/tts/victoria/models/voices/eva.pt',
      ]
    : []),
  ...(languages.has('en')
    ? [
        'scripts/tts/victoria/models/kokoro-v1_0.pth',
        ...['bf_emma', 'bf_isabella', 'bm_george', 'bm_fable'].map(
          voice => `scripts/tts/victoria/models/voices/${voice}.pt`
        ),
      ]
    : []),
  ...(languages.has('pl')
    ? ['pl_PL-gosia-medium', 'pl_PL-darkman-medium', 'pl_PL-bass-high'].flatMap(voice => [
        `scripts/tts/victoria/models/piper/${voice}.onnx`,
        `scripts/tts/victoria/models/piper/${voice}.onnx.json`,
      ])
    : []),
  'scripts/tts/victoria/models/config.json',
  'scripts/stt/parakeet/models/parakeet-tdt-0.6b-v3-Q8_0.gguf',
]

async function main() {
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
