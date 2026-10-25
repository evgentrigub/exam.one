import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import {
  copyFileSync,
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { parseEnv } from 'node:util'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const manifest = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'))
const pnpmVersion = manifest.packageManager.split('@')[1].split('+')[0]
const jwt = 'existing-jwt-secret-that-must-never-be-changed'
const encryptionKey = Buffer.alloc(32, 7).toString('base64')

function fixture(t, { missing = [], overrides = {}, contents } = {}) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'exam-one onboarding '))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  mkdirSync(path.join(dir, 'scripts'))
  mkdirSync(path.join(dir, 'bin'))
  for (const file of ['stack-install.sh', 'stack-install.mjs']) {
    copyFileSync(path.join(root, 'scripts', file), path.join(dir, 'scripts', file))
  }
  writeFileSync(path.join(dir, 'package.json'), JSON.stringify(manifest))
  writeFileSync(
    path.join(dir, '.env.example'),
    'FRONTEND_PORT=3000\nJWT_SECRET=\nSECRETS_ENCRYPTION_KEY=\n'
  )
  if (contents !== undefined) writeFileSync(path.join(dir, '.env'), contents)
  const mockTool = `#!${process.execPath}
import { appendFileSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { parseEnv } from 'node:util';
const tool = path.basename(process.argv[1]);
const args = process.argv.slice(2);
appendFileSync(process.env.TEST_LOG, JSON.stringify({tool, args, tts: process.env.TTS_BASE_URL, packs: process.env.STACK_SEED_PACKS}) + '\\n');
if (tool === 'npm') { console.log('11.0.0'); }
else if (tool === 'pnpm' && args[0] === '--version') { console.log(process.env.TEST_PNPM_VERSION); }
else if (tool === 'pnpm') { if (args[0] === process.env.TEST_FAIL_STEP) process.exit(7); }
else if (tool === 'docker' && args[0] === '--version') { console.log('Docker version 28'); }
else if (tool === 'docker' && args[1] === 'version') { if(process.env.TEST_NO_COMPOSE) process.exit(1); console.log('Docker Compose version v2.40'); }
else if (tool === 'docker' && args.includes('--help')) { console.log(process.env.TEST_NO_WAIT ? 'No wait support' : '  --wait  Wait for services'); }
else if (tool === 'docker' && args[0] === 'info') { if(process.env.TEST_DOCKER_STOPPED) process.exit(1); }
else if (tool === 'docker' && args.includes('config')) {
  if (process.env.TEST_INVALID_COMPOSE) process.exit(1);
  const values = {...parseEnv(readFileSync(args[args.indexOf('--env-file') + 1], 'utf8')), ...process.env};
  console.log(JSON.stringify({services: { backend: {environment: values}, frontend: {ports: [{target: 3000, published: values.FRONTEND_PORT || '3000'}]}}}));
} else { process.exit(2); }
`
  // Give Node mocks an absolute interpreter so an isolated PATH can truly omit tools.
  for (const tool of ['npm', 'pnpm', 'docker']) {
    if (!missing.includes(tool))
      writeFileSync(path.join(dir, 'bin', tool), mockTool, { mode: 0o755 })
  }
  if (!missing.includes('node')) {
    writeFileSync(
      path.join(dir, 'bin', 'node'),
      `#!/bin/bash
if [[ "$1" == '--version' ]]; then
  printf '%s\\n' "$TEST_NODE_VERSION"
else
  exec '${process.execPath.replaceAll("'", "'\\''")}' "$@"
fi
`,
      { mode: 0o755 }
    )
  }
  const env = {
    ...process.env,
    PATH: path.join(dir, 'bin'),
    TEST_LOG: path.join(dir, 'calls.jsonl'),
    TEST_NODE_VERSION: 'v24.0.0',
    TEST_PNPM_VERSION: pnpmVersion,
  }
  delete env.JWT_SECRET
  delete env.SECRETS_ENCRYPTION_KEY
  Object.assign(env, overrides)
  return {
    dir,
    run: (...args) =>
      spawnSync('/bin/bash', [path.join(dir, 'scripts', 'stack-install.sh'), ...args], {
        cwd: os.tmpdir(),
        env,
        encoding: 'utf8',
        timeout: 10_000,
      }),
    calls: () =>
      existsSync(env.TEST_LOG)
        ? readFileSync(env.TEST_LOG, 'utf8')
            .trim()
            .split('\n')
            .map(line => JSON.parse(line))
        : [],
    readEnv: () => readFileSync(path.join(dir, '.env'), 'utf8'),
  }
}

test('reports all missing prerequisites without creating .env or installing anything', t => {
  const f = fixture(t, { missing: ['node', 'npm', 'pnpm', 'docker'] })
  const result = f.run()
  assert.equal(result.status, 1)
  assert.match(result.stderr, /Node.js.*missing/)
  assert.match(result.stderr, /pnpm.*missing/)
  assert.match(result.stderr, /Docker.*missing/)
  assert.equal(existsSync(path.join(f.dir, '.env')), false)
  assert.deepEqual(f.calls(), [])
})

for (const [name, overrides, message] of [
  ['outdated Node', { TEST_NODE_VERSION: 'v22.0.0' }, /Node.js 24/],
  ['wrong pnpm version', { TEST_PNPM_VERSION: '9.0.0' }, /npm install -g pnpm@/],
  ['missing Compose', { TEST_NO_COMPOSE: '1' }, /Docker Compose/],
  ['Compose without --wait', { TEST_NO_WAIT: '1' }, /--wait/],
  ['stopped Docker', { TEST_DOCKER_STOPPED: '1' }, /engine is stopped or inaccessible/],
]) {
  test(`blocks installation for ${name}`, t => {
    const f = fixture(t, { overrides })
    const result = f.run()
    assert.equal(result.status, 1)
    assert.match(result.stderr, message)
    assert.equal(existsSync(path.join(f.dir, '.env')), false)
    assert.equal(
      f.calls().some(call => call.args[0] === 'install'),
      false
    )
  })
}

test('--check is read-only and npm is optional when pnpm works', t => {
  const f = fixture(t, { missing: ['npm'] })
  const result = f.run('--check')
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /npm is unavailable/)
  assert.match(result.stdout, /All prerequisite checks passed/)
  assert.equal(existsSync(path.join(f.dir, '.env')), false)
  assert.equal(
    f.calls().some(call => call.args[0] === 'install' || call.args.includes('config')),
    false
  )
})

test('fresh install creates private secrets, installs dependencies, then starts the stack', t => {
  const f = fixture(t)
  const result = f.run()
  assert.equal(result.status, 0, result.stderr)
  const values = parseEnv(f.readEnv())
  assert.equal(statSync(path.join(f.dir, '.env')).mode & 0o777, 0o600)
  assert.ok(values.JWT_SECRET.length >= 32)
  assert.equal(Buffer.from(values.SECRETS_ENCRYPTION_KEY, 'base64').length, 32)
  assert.ok(!result.stdout.includes(values.JWT_SECRET))
  assert.ok(!result.stdout.includes(values.SECRETS_ENCRYPTION_KEY))
  const steps = f
    .calls()
    .filter(call => call.tool === 'pnpm' && call.args[0] !== '--version')
    .map(call => call.args)
  assert.deepEqual(steps, [['install', '--frozen-lockfile'], ['stack:up']])
})

test('rerunning preserves existing configuration and secrets byte for byte', t => {
  const contents = `# My settings\nFRONTEND_PORT=4321\nJWT_SECRET=${jwt}\nSECRETS_ENCRYPTION_KEY=${encryptionKey}\n`
  const f = fixture(t, { contents })
  for (let attempt = 0; attempt < 2; attempt++) {
    const result = f.run()
    assert.equal(result.status, 0, result.stderr)
    assert.equal(f.readEnv(), contents)
    assert.match(result.stdout, /http:\/\/localhost:4321/)
  }
})

test('fills empty secrets without replacing an existing JWT or custom settings', t => {
  const f = fixture(t, {
    contents: `FRONTEND_PORT=4321\nJWT_SECRET=${jwt}\nSECRETS_ENCRYPTION_KEY=\n`,
  })
  assert.equal(f.run().status, 0)
  const values = parseEnv(f.readEnv())
  assert.equal(values.JWT_SECRET, jwt)
  assert.equal(values.FRONTEND_PORT, '4321')
  assert.equal(Buffer.from(values.SECRETS_ENCRYPTION_KEY, 'base64').length, 32)
})

test('handles exported, indented blank assignments and appends missing keys', t => {
  const f = fixture(t, {
    contents: '# Custom setup\n\texport JWT_SECRET = ""\nFRONTEND_PORT=4444\n',
  })
  const result = f.run()
  assert.equal(result.status, 0, result.stderr)
  const values = parseEnv(f.readEnv())
  assert.ok(values.JWT_SECRET.length >= 32)
  assert.equal(Buffer.from(values.SECRETS_ENCRYPTION_KEY, 'base64').length, 32)
  assert.equal(values.FRONTEND_PORT, '4444')
})

test('does not replace a secret with an explicitly empty environment override', t => {
  const contents = `JWT_SECRET=${jwt}\nSECRETS_ENCRYPTION_KEY=${encryptionKey}\n`
  const f = fixture(t, { contents, overrides: { JWT_SECRET: '' } })
  const result = f.run()
  assert.equal(result.status, 1)
  assert.match(result.stderr, /empty value/)
  assert.equal(f.readEnv(), contents)
  assert.equal(
    f.calls().some(call => call.args[0] === 'install'),
    false
  )
})

for (const [name, contents] of [
  ['short JWT', `JWT_SECRET=short\nSECRETS_ENCRYPTION_KEY=${encryptionKey}\n`],
  [
    'placeholder JWT',
    `JWT_SECRET=change-me-in-production\nSECRETS_ENCRYPTION_KEY=${encryptionKey}\n`,
  ],
  ['invalid encryption key', `JWT_SECRET=${jwt}\nSECRETS_ENCRYPTION_KEY=invalid\n`],
]) {
  test(`rejects ${name} without modifying configuration or installing dependencies`, t => {
    const f = fixture(t, { contents })
    const result = f.run()
    assert.equal(result.status, 1)
    assert.equal(f.readEnv(), contents)
    assert.equal(
      f.calls().some(call => call.args[0] === 'install'),
      false
    )
    assert.ok(!result.stderr.includes(encryptionKey))
  })
}

test('honors exported secrets and host audio settings, and supports core-only installation', t => {
  const f = fixture(t, {
    contents:
      'JWT_SECRET=\nSECRETS_ENCRYPTION_KEY=\nTTS_BASE_URL=http://localhost:9991\nSTACK_SEED_PACKS=goethe-de-a2\n',
    overrides: { JWT_SECRET: jwt, SECRETS_ENCRYPTION_KEY: encryptionKey },
  })
  const before = f.readEnv()
  const result = f.run('--core')
  assert.equal(result.status, 0, result.stderr)
  assert.equal(f.readEnv(), before)
  const startup = f.calls().find(call => call.args[0] === 'stack:up:core')
  assert.equal(startup.tts, 'http://localhost:9991')
  assert.equal(startup.packs, 'goethe-de-a2')
})

for (const step of ['install', 'stack:up']) {
  test(`reports ${step} failure and preserves prepared secrets for retry`, t => {
    const f = fixture(t, { overrides: { TEST_FAIL_STEP: step } })
    const result = f.run()
    assert.equal(result.status, 1)
    assert.match(result.stderr, /failed/)
    assert.ok(parseEnv(f.readEnv()).JWT_SECRET)
    assert.ok(!result.stdout.includes('Stack startup finished'))
    if (step === 'install')
      assert.equal(
        f.calls().some(call => call.args[0] === 'stack:up'),
        false
      )
  })
}

test('rejects invalid Compose configuration before writing .env', t => {
  const f = fixture(t, { overrides: { TEST_INVALID_COMPOSE: '1' } })
  assert.equal(f.run().status, 1)
  assert.equal(existsSync(path.join(f.dir, '.env')), false)
})

test('help and invalid options do not run tools', t => {
  const f = fixture(t)
  assert.equal(f.run('--help').status, 0)
  assert.equal(f.run('--unknown').status, 1)
  assert.deepEqual(f.calls(), [])
})
