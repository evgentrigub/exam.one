import { afterEach, beforeEach, describe, expect, it } from '@jest/globals'
import type { INestApplication } from '@nestjs/common'
import { Test, type TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { createPrismaClient } from '@exam-one/database'
import { AppModule } from '../src/app.module'
import { configureApp } from '../src/bootstrap'

describe('Auth + health (e2e)', () => {
  let app: INestApplication
  const prisma = createPrismaClient()
  const email = `e2e-${Date.now()}@exam.one`

  beforeEach(async () => {
    process.env['JWT_SECRET'] = 'e2e-test-secret-at-least-32-chars'
    process.env['SECRETS_ENCRYPTION_KEY'] = Buffer.alloc(32, 5).toString('base64')
    process.env['DATABASE_URL'] ??=
      'postgresql://exam_one:exam_one@localhost:5432/exam_one?schema=public'
    process.env['FRONTEND_URL'] ??= 'http://localhost:3000'
    process.env['EMAIL_PROVIDER'] ??= 'none'
    process.env['AUTH_COOKIE_SECURE'] ??= 'false'

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    configureApp(app)
    await app.init()
  })

  afterEach(async () => {
    await prisma.user.deleteMany({ where: { email } }).catch(() => undefined)
    if (app) await app.close()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('/api/v1/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200)
      .expect({ data: { status: 'ok', service: 'exam.one-backend' } })
  })

  it('/api/v1/health/ready (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/health/ready')
      .expect(200)
      .expect({ data: { status: 'ok', checks: { database: 'up', redis: 'up' } } })
  })

  it('register → me → logout; unauthenticated /users/me is 401', async () => {
    const agent = request.agent(app.getHttpServer())

    const register = await agent
      .post('/api/v1/auth/register')
      .send({ name: 'E2E User', email, password: 'password12' })
      .expect(201)

    // Nest may return 200 or 201 depending on default — accept either via status check
    expect(register.body.data.user.email).toBe(email)
    expect(register.body.data.requiresEmailVerification).toBe(false)

    const me = await agent.get('/api/v1/auth/me').expect(200)
    expect(me.body.data.user.email).toBe(email)

    await agent.post('/api/v1/auth/logout').expect(201)

    await request(app.getHttpServer()).get('/api/v1/users/me').expect(401)
  })

  it('does not issue a session from verify-email when the account is already verified', async () => {
    const agent = request.agent(app.getHttpServer())
    await agent
      .post('/api/v1/auth/register')
      .send({ name: 'E2E User', email, password: 'password12' })
      .expect(201)
    await agent.post('/api/v1/auth/logout').expect(201)

    const verify = await request(app.getHttpServer())
      .post('/api/v1/auth/verify-email')
      .send({ email, code: '000000' })
      .expect(400)

    expect(verify.body).toEqual(
      expect.objectContaining({
        code: 'INVALID_CODE',
      })
    )
    expect(verify.headers['set-cookie']).toBeUndefined()

    await request(app.getHttpServer()).get('/api/v1/auth/me').expect(401)
  })

  it('locks login after five failed attempts', async () => {
    const agent = request.agent(app.getHttpServer())
    await agent
      .post('/api/v1/auth/register')
      .send({ name: 'E2E User', email, password: 'password12' })
      .expect(201)
    await agent.post('/api/v1/auth/logout').expect(201)

    for (let i = 0; i < 5; i++) {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email, password: 'wrong-password' })
        .expect(401)
    }

    const locked = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password: 'wrong-password' })
      .expect(429)

    expect(locked.body).toEqual(expect.objectContaining({ code: 'TOO_MANY_ATTEMPTS' }))
  })

  it('unauthenticated /llm/health is 401; authed health returns the AI envelope', async () => {
    await request(app.getHttpServer()).get('/api/v1/llm/health').expect(401)

    const agent = request.agent(app.getHttpServer())
    await agent
      .post('/api/v1/auth/register')
      .send({ name: 'E2E User', email, password: 'password12' })
      .expect(201)

    const health = await agent.get('/api/v1/llm/health').expect(200)
    expect(health.body).toEqual({
      data: {
        configured: false,
        connected: false,
        provider: null,
        model: null,
        message: 'No LLM API key is configured. Add one in Settings → AI provider.',
      },
      error: null,
    })
  })

  it('LLM settings belong to the user: defaults, validation, and no provider without a key', async () => {
    await request(app.getHttpServer()).get('/api/v1/settings/llm').expect(401)

    const agent = request.agent(app.getHttpServer())
    await agent
      .post('/api/v1/auth/register')
      .send({ name: 'E2E User', email, password: 'password12' })
      .expect(201)

    const settings = await agent.get('/api/v1/settings/llm').expect(200)
    expect(settings.body).toEqual({
      data: { provider: null, model: null, fallbackModels: [], reasoningEffort: 'medium', keys: [] },
    })

    await agent.put('/api/v1/settings/llm/keys/deepseek').send({ apiKey: 'sk-something-long' }).expect(400)
    await agent.put('/api/v1/settings/llm/keys/openai').send({ apiKey: 'short' }).expect(400)

    const missingKey = await agent
      .put('/api/v1/settings/llm')
      .send({ provider: 'openrouter', model: 'google/gemma-4-31b-it:free' })
      .expect(400)
    expect(missingKey.body).toEqual(expect.objectContaining({ code: 'LLM_KEY_MISSING' }))

    await agent.get('/api/v1/settings/llm/models?provider=openrouter').expect(400)
  })

  it('media endpoints need a session; a new account starts on Cambridge and lists its audio', async () => {
    await request(app.getHttpServer()).get('/api/v1/media/summary').expect(401)
    await request(app.getHttpServer()).get('/api/v1/media/audio').expect(401)

    const agent = request.agent(app.getHttpServer())
    await agent
      .post('/api/v1/auth/register')
      .send({ name: 'E2E User', email, password: 'password12' })
      .expect(201)

    const settings = await agent.get('/api/v1/settings/me').expect(200)
    expect(settings.body.data).toEqual(expect.objectContaining({ packId: 'cambridge-en-a2', targetLanguage: 'en' }))

    const summary = await agent.get('/api/v1/media/summary').expect(200)
    expect(summary.body.data).toEqual({ voiceBytes: expect.any(Number), audioBytes: expect.any(Number), sttBytes: expect.any(Number) })

    const audio = await agent.get('/api/v1/media/audio').expect(200)
    expect(Array.isArray(audio.body.data.rows)).toBe(true)

    await agent.post('/api/v1/media/audio/delete').send({ ids: 'not-a-list' }).expect(400)
    const none = await agent.post('/api/v1/media/audio/delete').send({ ids: ['generated:cambridge-en-a2:../../x'] }).expect(200)
    expect(none.body.data).toEqual({ deletedRows: 0, deletedFiles: 0, freedBytes: 0 })

    await agent.put('/api/v1/media/voices/default').send({ lang: 'xx', voiceId: 'bf_emma' }).expect(400)
  })
})
