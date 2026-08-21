#!/usr/bin/env node
/**
 * Generate bundled A2 listening WAVs when the host seed directory is empty.
 * Skips when seed WAVs already exist. Waits for Kokoro on the host port.
 */
import { mkdir, readdir } from 'node:fs/promises'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const audioRoot = path.join(repoRoot, 'apps/frontend/public/audio/listening/a2')
const ttsBaseUrl = (process.env.TTS_BASE_URL ?? 'http://127.0.0.1:8881').replace(/\/$/, '')
const timeoutMs = Number(process.env.STACK_SEED_AUDIO_TIMEOUT_MS ?? 480000)

async function hasSeedWavs() {
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
  await mkdir(audioRoot, { recursive: true })

  if (await hasSeedWavs()) {
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
