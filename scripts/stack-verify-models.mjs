#!/usr/bin/env node
/** Verify the same speech selections/mounts as setup, using container Python. */
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
for (const script of ['scripts/stt/setup.sh', 'scripts/tts/victoria/download-models.sh']) {
  const result = spawnSync('bash', [script, '--verify'], { cwd: repoRoot, stdio: 'inherit' })
  if (result.error) console.error('[stack:verify-models]', result.error.message)
  if (result.status !== 0) process.exit(result.status ?? 1)
}
console.log('[stack:verify-models] TTS and STT model snapshots are present.')
