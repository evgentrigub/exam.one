// Acceptance harness. Run only against the disposable pack_check database.
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
const require = createRequire(new URL('../apps/backend/package.json', import.meta.url))
const databaseUrl = process.env.DATABASE_URL ?? ''
if (!databaseUrl.includes(':55432/pack_check')) throw new Error('Use the disposable pack_check database on port 55432')
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'pack-check-secret-with-more-than-thirty-two-characters'
process.env.EMAIL_PROVIDER = 'none'
process.env.AUTH_COOKIE_SECURE = 'false'
process.env.FRONTEND_URL = 'http://localhost:3000'
process.env.OPENAI_API_KEY = ''
process.env.OPENROUTER_API_KEY = ''
const { Test } = require('@nestjs/testing')
const { AppModule } = require('./dist/app.module.js')
const { configureApp } = require('./dist/bootstrap.js')
const { LlmService } = require('./dist/llm/llm.service.js')
const { createPrismaClient, seedCatalog } = require('@exam-one/database')
const packs = require('@exam-one/exam-packs')
const { syntheticEnglishA1, syntheticPayloads } = require('../../data/dist/testing/english-a1.js')
assert(packs.getPack('synthetic-en-a1'), 'Temporarily register the fixture in data/src/registry.ts and build data before running')
const prisma = createPrismaClient()
const before = await seedCatalog(prisma)
const counts = { exercises: await prisma.exercise.count(), sets: await prisma.mockExamSet.count() }
await seedCatalog(prisma)
assert.equal(await prisma.exercise.count(), counts.exercises)
assert.equal(await prisma.mockExamSet.count(), counts.sets)
console.log('Seed idempotency passed', before)
let generatedCount = 0
let providerMode = 'valid'
let releaseProvider
let providerEntered
let browserDelay = 0
const module = await Test.createTestingModule({ imports: [AppModule] }).overrideProvider(LlmService).useValue({
  onModuleInit() {}, getConfig: () => providerMode === 'missing' ? null : ({ provider: 'test' }), missingKeyError: () => 'Missing test key',
  health: async () => ({ data: { configured: true, connected: true, provider: 'test', model: 'fixture', message: null }, error: null }),
  complete: async messages => {
    const prompt = messages.map(m => m.content).join('\n')
    generatedCount++
    if (providerMode === 'invalid') return '[{"title":"Invalid fixture"}]'
    if (providerMode === 'delayed') { providerEntered(); await new Promise(resolve => { releaseProvider = resolve }) }
    if (browserDelay) await new Promise(resolve => setTimeout(resolve, browserDelay))
    for (const payload of Object.values(syntheticPayloads)) if (prompt.includes(JSON.stringify([payload]))) return JSON.stringify([payload])
    if (prompt.includes('maxPoints')) return JSON.stringify({ totalPoints: 3.5, maxPoints: 3.5, criteria: [{ id: 'content', label: 'Content', maxPoints: 2.5, points: 2.5, comment: 'Clear' }, { id: 'clarity', label: 'Clarity', maxPoints: 1, points: 1, comment: 'Clear' }], summary: 'Fixture review', strengths: [], improvements: [] })
    throw new Error('Unrecognized fixture prompt')
  },
}).compile()
const app = module.createNestApplication()
configureApp(app)
await app.listen(3001, '127.0.0.1')
const request = require('supertest')
const agent = request.agent(app.getHttpServer())
const email = `pack-check-${Date.now()}@example.test`
const password = 'PackCheck-2026!'
await agent.post('/api/v1/auth/register').send({ email, password, name: 'Pack Check' }).expect(201)
const user = await prisma.user.findUniqueOrThrow({ where: { email } })
const headers = { 'x-exam-pack': 'synthetic-en-a1' }
await agent.patch('/api/v1/settings/me').send({ packId: 'synthetic-en-a1' }).expect(200)
const setting = await agent.get('/api/v1/settings/me').set(headers).expect(200)
assert.equal(setting.body.data.examLevel, 'A1')
assert.equal(setting.body.data.targetLanguage, 'en')
for (const module of syntheticEnglishA1.structure) for (const part of module.parts) {
  const endpoint = module.id === 'writing' ? 'generate-topics' : `generate-${module.id}`
  const body = module.id === 'writing' ? { part: part.n, prompt: 'default', difficulty: 'A1' } : { difficulty: 'A1', prompts: [{ part: part.n, prompt: 'default' }] }
  const response = await agent.post(`/api/v1/ai/${endpoint}`).set(headers).send(body).expect(200)
  assert.equal(response.body.error, null, response.body.error)
  const payload = response.body.data[0]
  assert.equal(payload.difficulty, 'A1')
  payload.id = `shared-${module.id}-${part.n}`
  await agent.post('/api/v1/exercises').set(headers).send({ skill: module.id.toUpperCase(), payload }).expect(201)
  await agent.put(`/api/v1/drafts/${module.id.toUpperCase()}/${payload.id}`).set(headers).send({ payload: { answers: { a: 0, b: 1, message: 'Please come to lunch', intro: 'Hello I am Alex' } } }).expect(200)
  const draft = await agent.get(`/api/v1/drafts/${module.id.toUpperCase()}/${payload.id}`).set(headers).expect(200)
  assert.equal(draft.body.data.packId, 'synthetic-en-a1')
  const attempt = await agent.post('/api/v1/attempts').set(headers).send({ skill: module.id.toUpperCase(), exerciseExternalId: payload.id, answers: draft.body.data.payload.answers }).expect(201)
  assert.equal(attempt.body.data.packId, 'synthetic-en-a1')
  assert.equal(attempt.body.data.snapshot.version, 1)
  if (part.itemFormat === 'freeform' || part.itemFormat === 'recording') {
    const response = await agent.post(module.id === 'writing' ? '/api/v1/ai/review' : '/api/v1/ai/review-speaking').set(headers).send({ topic: payload, answers: draft.body.data.payload.answers, prompt: 'default', ...(module.id === 'writing' ? { userContent: 'Please come to lunch' } : {}) }).expect(200)
    assert.equal(response.body.error, null, response.body.error)
    assert.equal(response.body.data.maxPoints, 3.5)
    const graded = await agent.patch(`/api/v1/attempts/${attempt.body.data.id}`).set(headers).send({ result: { score: 999, maxScore: 999, review: response.body.data } }).expect(200)
    assert.equal(graded.body.data.result.score, 3.5)
    const invalidReview = { ...response.body.data, totalPoints: 99 }
    await agent.patch(`/api/v1/attempts/${attempt.body.data.id}`).set(headers).send({ result: { review: invalidReview } }).expect(400)
  }
}
// A colliding external id must remain isolated across drafts, catalogs and attempts.
const goetheReadingSeed = await prisma.exercise.findFirstOrThrow({ where: { packId: 'goethe-de-a2', skill: 'READING', userId: null } })
await agent.post('/api/v1/exercises').set('x-exam-pack','goethe-de-a2').send({ skill: 'READING', payload: { ...goetheReadingSeed.payload, id: 'shared-reading-7', title: 'Other pack', difficulty: 'A2' } }).expect(201)
const goethePart = packs.goetheDeA2.structure.find(module => module.id === 'reading').parts.find(part => part.n === goetheReadingSeed.payload.testingPart)
const goetheView = goethePart.adapter.project(goetheReadingSeed.payload)
const goetheAttempt = await agent.post('/api/v1/attempts').set('x-exam-pack','goethe-de-a2').send({ skill: 'READING', exerciseExternalId: 'shared-reading-7', answers: { responses: Object.fromEntries(goetheView.questions.map(question => [question.id, question.correctAnswer])) }, result: { score: 999, maxScore: 999 } }).expect(201)
assert.equal(goetheAttempt.body.data.result.score, 5)
assert.equal(goetheAttempt.body.data.result.maxScore, 5)
await agent.put('/api/v1/drafts/READING/shared-reading-7').set('x-exam-pack','goethe-de-a2').send({ payload: { text: 'Goethe draft' } }).expect(200)
const isolated = await agent.get('/api/v1/drafts/READING/shared-reading-7').set(headers).expect(200)
assert.equal(isolated.body.data.payload.text, undefined)
for (const packId of ['goethe-de-a2', 'synthetic-en-a1']) {
  await agent.put('/api/v1/generation-jobs/READING').set('x-exam-pack', packId).send({ status: 'FAILED', payload: { part: packId === 'synthetic-en-a1' ? 7 : 1, marker: packId } }).expect(200)
}
const job = await agent.get('/api/v1/generation-jobs/READING').set(headers).expect(200)
assert.equal(job.body.data.payload.marker, 'synthetic-en-a1')
const catalog = await agent.get('/api/v1/exercises?skill=READING').set(headers).expect(200)
assert.equal(catalog.body.data.find(row => row.externalId === 'shared-reading-7').payload.title, 'Synthetic selection')
const recorded = await agent.get('/api/v1/attempts?skill=READING').set(headers).expect(200)
assert(recorded.body.data.every(row => row.packId === 'synthetic-en-a1'))
const snapshot = recorded.body.data[0]
await agent.post('/api/v1/exercises').set(headers).send({ skill: 'READING', payload: { ...syntheticPayloads[7], id: 'shared-reading-7', testingPart: 7, title: 'Edited after submission' } }).expect(201)
const preserved = await agent.get(`/api/v1/attempts/${snapshot.id}`).set(headers).expect(200)
assert.equal(preserved.body.data.snapshot.view.title, 'Synthetic selection')
await agent.post('/api/v1/exercises').set(headers).send({ skill: 'READING', payload: { id: 'invalid', testingPart: 7, title: 'Invalid' } }).expect(400)
const mocks = await agent.get('/api/v1/mock-exam/sets').set(headers).expect(200)
assert.equal(mocks.body.data.length, 0)
await agent.post('/api/v1/mock-exam/sets').set(headers).send({ set: { id: 'unsupported', examId: 'synthetic-en-a1', level: 'A1', title: 'Unavailable', generated: true, createdAt: new Date().toISOString(), modules: [], content: {} } }).expect(403)
const unsupportedTts = await agent.post('/api/v1/tts/generate-listening-audio').set(headers).send({ exercise: { ...syntheticPayloads[11], id: 'shared-listening-11', testingPart: 11 } }).expect(200)
assert.equal(unsupportedTts.body.data, null)
assert.match(unsupportedTts.body.error, /not available|unavailable/i)
const unsupportedStt = await agent.post('/api/v1/stt/transcribe').set(headers).attach('file', Buffer.from('fixture'), { filename: 'fixture.webm', contentType: 'audio/webm' }).expect(200)
assert.equal(unsupportedStt.body.data, null)
assert.match(unsupportedStt.body.error, /unavailable/i)
const generationBody = { difficulty: 'A1', prompts: [{ part: 7, prompt: 'default' }] }
for (const mode of ['missing', 'invalid']) {
  providerMode = mode
  const failure = await agent.post('/api/v1/ai/generate-reading').set(headers).send(generationBody).expect(200)
  assert.equal(failure.body.data, null)
  assert(failure.body.error)
}
providerMode = 'delayed'
const entered = new Promise(resolve => { providerEntered = resolve })
const outstanding = agent.post('/api/v1/ai/generate-reading').set(headers).send(generationBody).then(response => response)
await entered
await agent.patch('/api/v1/settings/me').set(headers).send({ packId: 'goethe-de-a2' }).expect(200)
releaseProvider()
const late = await outstanding
assert.equal(late.body.data[0].difficulty, 'A1')
providerMode = 'valid'
await agent.patch('/api/v1/settings/me').set('x-exam-pack', 'goethe-de-a2').send({ packId: 'synthetic-en-a1' }).expect(200)
const history = await prisma.attempt.create({ data: { userId: user.id, packId: 'goethe-de-c1', skill: 'WRITING', answers: { answer: 'Historical C1 response' }, snapshot: { version: 0, packId: 'goethe-de-c1', payload: { title: 'C1 history' } } } })
await agent.get(`/api/v1/attempts/${history.id}`).set(headers).expect(200)
await agent.patch(`/api/v1/attempts/${history.id}`).set(headers).send({ answers: {} }).expect(404)
await agent.patch('/api/v1/settings/me').send({ packId: 'goethe-de-c1' }).expect(400)
await agent.post('/api/v1/ai/generate-reading').set('x-exam-pack','goethe-de-c1').send(generationBody).expect(400)
const stranger = request.agent(app.getHttpServer())
await stranger.post('/api/v1/auth/register').send({ email: `other-${email}`, password, name: 'Other fixture user' }).expect(201)
await stranger.get(`/api/v1/attempts/${history.id}`).set(headers).expect(404)
await stranger.patch(`/api/v1/attempts/${snapshot.id}`).set(headers).send({ answers: {} }).expect(404)
console.log('HTTP generation, fractional review, snapshots, drafts, isolation and inactive history passed', { generatedCount })
if (process.argv.includes('--serve')) {
  browserDelay = 20000
  console.log('Browser fixture server ready on http://localhost:3001', { email, password })
} else { await app.close(); await prisma.$disconnect() }
