// Prompt-quality eval for a pack's generator prompts (roadmap 2.13, packs since 2.15).
//
// Drives every generator prompt of one pack through the real LLM and scores the output against the
// same validators production uses, so a prompt rewrite can be compared before/after.
// Needs no Nest, no database and no HTTP server: it mirrors PackAiService.generate() and
// talks to the LLM adapter directly.
//
//   node scripts/eval-prompts.mjs --control          # free: score the bundled seeds only
//   node scripts/eval-prompts.mjs --n 3 --out FILE   # real run, 3 samples per prompt
//   node scripts/eval-prompts.mjs --n 1 --skill reading
//   node scripts/eval-prompts.mjs --pack goethe-de-a1 --control   # default pack: goethe-de-a2
//
// Requires a built workspace (`pnpm build`) and LLM env vars, which it reads from .env.
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(path.join(ROOT, 'apps/backend/package.json'))

const packs = require(path.join(ROOT, 'data/dist/index.js'))
const { getLlmConfig, callLlm } = require(path.join(ROOT, 'apps/backend/dist/ai/llm.adapter.js'))

// ---------------------------------------------------------------- args

const argv = process.argv.slice(2)
const flag = (name, fallback) => {
  const i = argv.indexOf(`--${name}`)
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : fallback
}
const CONTROL_ONLY = argv.includes('--control')
const N = Number(flag('n', '3'))
const ONLY_SKILL = flag('skill', null)
const OUT = flag('out', null)
const PACK_ID = flag('pack', 'goethe-de-a2')

// ---------------------------------------------------------------- env

function loadEnv() {
  try {
    for (const line of readFileSync(path.join(ROOT, '.env'), 'utf8').split('\n')) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
      if (!m) continue
      const value = m[2].replace(/\s+#.*$/, '').trim()
      if (process.env[m[1]] === undefined) process.env[m[1]] = value
    }
  } catch {
    // no .env - rely on the ambient environment
  }
}

// ---------------------------------------------------------------- scoring

/** Same fence-then-bracket scan the backend uses. */
function extractArray(raw) {
  if (typeof raw !== 'string') return null
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1] ?? raw
  const start = fenced.indexOf('[')
  if (start < 0) return null
  for (let end = fenced.lastIndexOf(']'); end > start; end = fenced.lastIndexOf(']', end - 1)) {
    try {
      const value = JSON.parse(fenced.slice(start, end + 1))
      if (Array.isArray(value)) return value
    } catch {
      // keep shrinking
    }
  }
  return null
}

const pack = packs.getPack(PACK_ID)
assert(pack, `${PACK_ID} is not registered`)
const IS_A2 = pack.packId === 'goethe-de-a2'

/** Every available part that has a generator prompt, in module order. */
const GENERATORS = pack.structure
  .flatMap(module =>
    module.parts
      .filter(part => part.available !== false)
      .map(part => ({ skill: module.id, part: part.n }))
  )
  .filter(g => packs.findPrompt(pack, g.skill, g.part, 'generator'))
  .filter(g => !ONLY_SKILL || g.skill === ONLY_SKILL)

const CYRILLIC = /[а-яА-ЯёЁ]/

/** Collect every string in a payload so we can language-check the generated content. */
function strings(value, acc = []) {
  if (typeof value === 'string') acc.push(value)
  else if (Array.isArray(value)) for (const v of value) strings(v, acc)
  else if (value && typeof value === 'object') for (const v of Object.values(value)) strings(v, acc)
  return acc
}

/**
 * The runtime gate production applies, lifted from PackAiService.validateGenerated.
 * Reading/listening have strict per-part rules; writing/speaking are near-vacuous here,
 * so `extraChecks` adds the assertions their validators do not make.
 */
function scorePayload(skill, payload) {
  const problems = []
  const data = payload && typeof payload === 'object' ? payload : {}
  const part = pack.structure
    .find(m => m.id === skill)
    ?.parts.find(p => p.n === data.testingPart)

  if (!part?.adapter || !part.runtime) {
    problems.push(`no registered part for testingPart=${data.testingPart}`)
    return problems
  }
  try {
    packs.validateView(part.adapter.project(data), part.runtime)
  } catch (error) {
    problems.push(`validateView: ${error.message}`)
  }
  try {
    part.validate?.(data, part.runtime)
  } catch (error) {
    problems.push(`validate: ${error.message}`)
  }
  problems.push(...extraChecks(skill, data, part))
  return problems
}

function extraChecks(skill, data, part) {
  const problems = []
  const all = strings(data)

  // The whole point of the pack: generated content must be German.
  const cyrillic = all.filter(s => CYRILLIC.test(s))
  if (cyrillic.length) problems.push(`cyrillic in output: ${JSON.stringify(cyrillic[0].slice(0, 60))}`)

  // The rest pins A2's documented rules; another pack states its own in `part.validate`.
  if (!IS_A2) return problems

  if (skill === 'writing') {
    const wc = data.wordCount
    const band = part.n === 1 ? [20, 30] : [30, 40]
    if (!wc || typeof wc.min !== 'number' || typeof wc.max !== 'number')
      problems.push('writing: wordCount.min/max missing')
    else if (wc.min !== band[0] || wc.max !== band[1])
      problems.push(`writing: wordCount ${wc.min}-${wc.max}, expected ${band[0]}-${band[1]}`)
    if (!Array.isArray(data.requirements) || data.requirements.length === 0)
      problems.push('writing: requirements missing')
    if (typeof data.description !== 'string' || !data.description.trim())
      problems.push('writing: description missing')   // defect 6.3
    if (!Array.isArray(data.category) || data.category.length === 0)
      problems.push('writing: category missing')      // defect 6.3
    if (typeof data.task !== 'string' || !data.task.trim()) problems.push('writing: task missing')
  }

  if (skill === 'speaking') {
    if (typeof data.theme !== 'string' || !data.theme.trim()) problems.push('speaking: theme missing')
    const cards = part.n === 1 ? ['answerQuestions', 'askQuestions'] : ['keywords']
    for (const key of cards) {
      const v = data[key]
      if (!Array.isArray(v) || v.length !== 4 || v.some(s => typeof s !== 'string' || !s.trim()))
        problems.push(`speaking: ${key} must be 4 non-empty strings`)
    }
  }

  if (skill === 'reading' && part.n === 4) {
    // Documented rule the runtime does not enforce (reuseOptions is never set).
    const answers = (data.questions ?? []).map(q => Number(q.correctAnswer))
    const matched = answers.filter(a => a !== 6)
    if (new Set(matched).size !== matched.length) problems.push('reading4: an advertisement is reused')
    if (answers.filter(a => a === 6).length !== 1) problems.push('reading4: expected exactly one x answer')
  }

  return problems
}

// ---------------------------------------------------------------- control

function runControl() {
  // Practice seeds only: mock-exam copies are the same content under another id.
  const seeds = Object.fromEntries(
    Object.entries(pack.seedExercises ?? {}).map(([skill, items]) => [
      skill,
      items.filter(item => item.examOnly !== true),
    ])
  )
  let failures = 0
  console.log('control: scoring the human-authored seeds (expect 0 problems)\n')
  for (const [skill, arr] of Object.entries(seeds)) {
    for (const seed of arr ?? []) {
      const problems = scorePayload(skill, seed)
      if (problems.length) {
        failures += 1
        console.log(`  FAIL ${skill} part ${seed.testingPart}: ${problems.join('; ')}`)
      }
    }
    console.log(`  ${skill.padEnd(10)} ${(arr ?? []).length} seeds scored`)
  }
  console.log(failures === 0 ? '\ncontrol PASS' : `\ncontrol FAIL (${failures})`)
  return failures
}

// ---------------------------------------------------------------- live run

async function runEval() {
  loadEnv()
  const config = getLlmConfig({
    provider: process.env.LLM_PROVIDER,
    openaiApiKey: process.env.OPENAI_API_KEY,
    openaiModel: process.env.OPENAI_MODEL,
    openrouterApiKey: process.env.OPENROUTER_API_KEY,
    openrouterModel: process.env.OPENROUTER_MODEL,
    reasoningEffort: process.env.LLM_REASONING_EFFORT,
  })
  if (!config) throw new Error('No LLM key configured - set OPENAI_API_KEY or OPENROUTER_API_KEY')

  let calls = 0
  const complete = async (messages, options) => {
    calls += 1
    return callLlm(config, messages, options)
  }

  const results = []

  // Mirrors PackAiService.generate() so the eval exercises the code path production uses.
  const generic = async (skill, part, complete) => {
    const spec = packs.findPrompt(pack, skill, part, 'generator')
    const definition = pack.structure
      .find(m => m.id === skill)
      ?.parts.find(p => p.n === part && p.available !== false)
    const content = spec.assemble({ count: 1 })
    let parsed = extractArray(await complete([{ role: 'user', content }], spec.llm))
    if (!parsed?.length) parsed = extractArray(await complete([{ role: 'user', content }], spec.llm))
    if (!parsed?.length) return { data: null, error: 'The provider did not return an exercise array' }
    const data = parsed.map(value => {
      const id = `${skill}-${pack.packId}-${Math.random().toString(36).slice(2)}`
      return packs.withQuestionIds({
        ...packs.coerceAnswerIndices(value),
        id,
        testingPart: part,
        difficulty: pack.cefr,
        createdAt: new Date().toISOString(),
      })
    })
    for (const payload of data) definition?.validate?.(payload, definition.runtime)
    return { data, error: null }
  }
  console.log(`pack=${pack.packId} provider=${config.provider} model=${config.model} effort=${config.reasoningEffort ?? 'n/a'} n=${N}\n`)

  for (const { skill, part } of GENERATORS) {
    const spec = packs.findPrompt(pack, skill, part, 'generator')
    if (!spec) { console.log(`  ${skill} ${part}: no generator prompt`); continue }

    for (let i = 0; i < N; i += 1) {
      const started = Date.now()
      let row = { skill, part, sample: i + 1, ok: false, problems: [], ms: 0, error: null }
      try {
        const res = await generic(skill, part, complete)
        row.ms = Date.now() - started
        if (res.error) row.error = res.error
        else if (!Array.isArray(res.data) || res.data.length === 0) row.error = 'empty data'
        else {
          const problems = res.data.flatMap(p => scorePayload(skill, p))
          row.problems = problems
          row.ok = problems.length === 0
        }
      } catch (error) {
        row.ms = Date.now() - started
        row.error = error.message
      }
      results.push(row)
      const status = row.ok ? 'PASS' : 'FAIL'
      const why = row.error ?? row.problems.join('; ')
      console.log(`  ${status} ${skill} ${part} #${i + 1} ${row.ms}ms ${why ? '- ' + why.slice(0, 110) : ''}`)
    }
  }

  console.log(`\n--- summary (llm calls: ${calls}) ---`)
  const byPrompt = new Map()
  for (const r of results) {
    const key = `${r.skill} ${r.part}`
    const agg = byPrompt.get(key) ?? { pass: 0, total: 0 }
    agg.total += 1
    if (r.ok) agg.pass += 1
    byPrompt.set(key, agg)
  }
  for (const [key, agg] of byPrompt) console.log(`  ${key.padEnd(14)} ${agg.pass}/${agg.total}`)
  const pass = results.filter(r => r.ok).length
  console.log(`  ${'TOTAL'.padEnd(14)} ${pass}/${results.length}`)

  if (OUT) {
    writeFileSync(OUT, JSON.stringify({ config: { provider: config.provider, model: config.model, effort: config.reasoningEffort }, n: N, calls, results }, null, 2))
    console.log(`\nwrote ${OUT}`)
  }
  return results.length - pass
}

const failures = CONTROL_ONLY ? runControl() : (runControl() === 0 ? await runEval() : 1)
process.exit(failures > 0 && CONTROL_ONLY ? 1 : 0)
