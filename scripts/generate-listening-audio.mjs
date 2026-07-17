#!/usr/bin/env node
/**
 * Pre-generate Kokoro German Martin WAV files for bundled A2 listening seeds.
 *
 * Prerequisites:
 *   1. ./scripts/tts/setup-kokoro.sh
 *   2. docker compose -f compose.tts.yaml up -d --build --wait
 *
 * Usage (from repo root):
 *   pnpm generate:listening-audio
 *
 * Env:
 *   TTS_BASE_URL  (default http://127.0.0.1:8881)
 *   TTS_VOICE     (default martin)
 *   TTS_SPEED     (default 1.0)
 *   TTS_LANG      (default de)
 *   FORCE=1       regenerate even when transcript hash matches
 */

import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile, access } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createJiti } from 'jiti'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const frontendRoot = path.join(repoRoot, 'apps/frontend')
const audioRoot = path.join(frontendRoot, 'public/audio/listening/a2')

const jiti = createJiti(import.meta.url, {
  alias: {
    '~': frontendRoot,
    '~~': frontendRoot,
    '@': frontendRoot,
  },
})

const listeningModule = await jiti.import(
  path.join(frontendRoot, 'data/listening/exerciseListening.ts'),
)
const { defaultListeningTopics } = listeningModule

const ttsModule = await jiti.import(
  path.join(frontendRoot, 'server/utils/tts/ttsAdapter.ts'),
)
const { synthesizeSpeech, checkTtsHealth, getTtsConfigFromEnv } = ttsModule

function hashTranscript(text) {
  return createHash('sha256').update(text.trim()).digest('hex')
}

function collectSegments(exercises) {
  const segments = []

  for (const exercise of exercises) {
    const id = exercise.id
    if (!id) continue

    if (exercise.testingPart === 1 || exercise.testingPart === 3) {
      for (const item of exercise.items ?? []) {
        const itemId = item.id
        if (!itemId || !item.transcript?.trim()) continue
        segments.push({
          relativePath: path.join(id, `${itemId}.wav`),
          transcript: item.transcript,
        })
      }
      continue
    }

    if (!exercise.transcript?.trim()) continue
    segments.push({
      relativePath: path.join(id, 'shared.wav'),
      transcript: exercise.transcript,
    })
  }

  return segments
}

async function fileExists(filePath) {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

async function main() {
  const force = process.env.FORCE === '1' || process.env.FORCE === 'true'
  const config = getTtsConfigFromEnv()

  console.log(`[generate-listening-audio] TTS base URL: ${config.baseUrl}`)
  const healthy = await checkTtsHealth(config)
  if (!healthy) {
    console.error(
      '[generate-listening-audio] Kokoro TTS is not reachable.\n' +
        '  1. Run: ./scripts/tts/setup-kokoro.sh\n' +
        '  2. Run: docker compose -f compose.tts.yaml up -d --build --wait\n' +
        '  3. Re-run: pnpm generate:listening-audio',
    )
    process.exit(1)
  }

  const segments = collectSegments(defaultListeningTopics)
  console.log(`[generate-listening-audio] ${segments.length} segment(s) to process`)

  let written = 0
  let skipped = 0

  for (const segment of segments) {
    const outPath = path.join(audioRoot, segment.relativePath)
    const hashPath = `${outPath}.hash`
    const nextHash = hashTranscript(segment.transcript)

    await mkdir(path.dirname(outPath), { recursive: true })

    if (!force && (await fileExists(outPath)) && (await fileExists(hashPath))) {
      const prevHash = (await readFile(hashPath, 'utf8')).trim()
      if (prevHash === nextHash) {
        console.log(`  skip  ${segment.relativePath}`)
        skipped += 1
        continue
      }
    }

    console.log(`  synth ${segment.relativePath}`)
    const audio = await synthesizeSpeech({ text: segment.transcript }, config)
    await writeFile(outPath, audio)
    await writeFile(hashPath, `${nextHash}\n`, 'utf8')
    written += 1
  }

  console.log(
    `[generate-listening-audio] done — wrote ${written}, skipped ${skipped}`,
  )
}

main().catch((error) => {
  console.error('[generate-listening-audio] failed', error)
  process.exit(1)
})
