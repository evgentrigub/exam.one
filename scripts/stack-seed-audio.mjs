#!/usr/bin/env node
/**
 * Generate bundled listening WAVs when a pack's host seed directory is empty (Goethe A2
 * seeds under /a2, and the mock Set 1 of Goethe A1, DELE A2, Cambridge A2 Key and Certyfikat
 * Polski A2 under /a1, /dele-es-a2, /cambridge-en-a2 and /certpol-pl-a2). Skips when every
 * directory already has WAVs. Waits for Kokoro on the host port.
 */
import { mkdir, readdir } from 'node:fs/promises'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ttsBaseUrl = (process.env.TTS_BASE_URL ?? 'http://127.0.0.1:8881').replace(/\/$/, '')
const timeoutMs = Number(process.env.STACK_SEED_AUDIO_TIMEOUT_MS ?? 480000)

const { bundledAudioDirs } = await import('./generate-listening-audio.mjs')
const audioRoots = bundledAudioDirs()

async function hasSeedWavs(audioRoot) {
  try {
    const entries = await readdir(audioRoot, { recursive: true })
    return entries.some(entry => String(entry).endsWith('.wav'))
  } catch {
    return false
  }
}

async function waitForTts() {
  const started = Date.now()
  const url = `${ttsBaseUrl}/v1/audio/voices`
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url)
      if (response.ok) return true
    } catch {
      // Kokoro is still starting
    }
    await new Promise(resolve => setTimeout(resolve, 5000))
  }
  return false
}

function runGenerate() {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(repoRoot, 'scripts/generate-listening-audio.mjs')], {
      cwd: repoRoot,
      stdio: 'inherit',
      env: process.env,
    })
    child.on('error', reject)
    child.on('exit', code => {
      if (code === 0) resolve()
      else reject(new Error(`generate-listening-audio exited ${code}`))
    })
  })
}

async function main() {
  for (const audioRoot of audioRoots) await mkdir(audioRoot, { recursive: true })

  const present = await Promise.all(audioRoots.map(hasSeedWavs))
  if (present.every(Boolean)) {
    console.log('[stack:seed-audio] Seed listening WAVs already present; skipping generation.')
    return
  }

  console.log(`[stack:seed-audio] Waiting for Kokoro at ${ttsBaseUrl}...`)
  const ready = await waitForTts()
  if (!ready) {
    console.warn(
      '[stack:seed-audio] Kokoro did not become healthy in time. The app stack is up; generate listening audio later with `pnpm generate:listening-audio` or retry `pnpm stack:seed-audio`.'
    )
    return
  }

  await runGenerate()
}

main().catch(error => {
  console.error('[stack:seed-audio] failed', error)
  process.exit(1)
})
