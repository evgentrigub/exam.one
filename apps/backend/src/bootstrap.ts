import { ValidationPipe, VersioningType, type INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import cookieParser from 'cookie-parser'
import { json, urlencoded } from 'express'
import helmet from 'helmet'
import { RequestIdInterceptor } from './core/interceptors/request-id.interceptor'

export function isSwaggerEnabled(
  nodeEnv = process.env['NODE_ENV'],
  swaggerEnabled = process.env['SWAGGER_ENABLED']
): boolean {
  if (swaggerEnabled === 'true') return true
  if (swaggerEnabled === 'false') return false
  return (nodeEnv ?? 'development') !== 'production'
}

export function configureApp(app: INestApplication): void {
  app.enableShutdownHooks()
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      referrerPolicy: { policy: 'no-referrer' },
    })
  )
  app.use(cookieParser())
  app.use(json({ limit: '5mb' }))
  app.use(urlencoded({ extended: true, limit: '5mb' }))
  app.setGlobalPrefix('api')
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' })
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  )
  app.useGlobalInterceptors(new RequestIdInterceptor())

  const frontendUrl = process.env['FRONTEND_URL'] ?? 'http://localhost:3000'
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  })

  if (!isSwaggerEnabled()) return

  const config = new DocumentBuilder()
    .setTitle('exam.one API')
    .setDescription(
      [
        '# exam.one Backend API',
        '',
        'Open-source, self-hostable language exam preparation platform providing comprehensive practice, mock exams, AI grading, and speech services.',
        '',
        '## Architecture & Design',
        '- **Backend**: Standalone NestJS application running on port 3001 with global prefix `/api` and URI versioning `/v1`.',
        '- **Frontend**: Nuxt 4 web application running on port 3000.',
        '- **Database**: PostgreSQL with Prisma ORM for accounts, learning settings, practice catalogs, user attempts, and mock sets.',
        '- **Speech Services**: Local or containerized Kokoro TTS (synthesis) and Parakeet STT (transcription).',
        '',
        '## Authentication Architecture',
        '- Authentication is session-based using **HTTP-only cookies**:',
        '  - `exam_one_access`: Short-lived JWT access token sent automatically by browsers/Postman cookie jars.',
        '  - `exam_one_refresh`: Long-lived refresh token used to rotate access tokens at `/api/v1/auth/refresh`.',
        '- When email verification is required (`requiresEmailVerification: true`), protected routes return `403 Forbidden` until confirmed with a 6-digit code.',
        '- Local accounts can also be recovered or password-reset via CLI: `pnpm auth:set-password --email user@example.com`.',
        '',
        '## Multi-Exam Pack Context (`x-exam-pack`)',
        '- exam.one supports multiple modular exam packs (e.g. `goethe-de-a2`, `goethe-de-c1`).',
        '- Requests resolve the active pack via the following cascade:',
        '  1. Explicit `x-exam-pack` header if provided in the HTTP request.',
        '  2. Authenticated user learning settings (`Setting.packId`).',
        '  3. Default system pack fallback (`goethe-de-a2`).',
        '- Inactive packs (such as C1) allow read-only historical attempt review but reject new practice attempts.',
        '',
        '## API Response Envelopes',
        '- **Standard REST API** (`ApiResponse<T>`):',
        '  ```json',
        '  {',
        '    "data": { ... },',
        '    "error": null',
        '  }',
        '  ```',
        '  On business/validation error: `{ "data": null, "error": { "code": "...", "message": "...", "details": ... } }`.',
        '- **AI & Speech Services** (`AiResponse<T>`):',
        '  ```json',
        '  {',
        '    "data": { ... },',
        '    "error": null',
        '  }',
        '  ```',
        '  Returns HTTP 200 with `{ "data": null, "error": "Reason" }` when an AI provider key is unconfigured or speech container is unavailable, allowing graceful client-side degradation.',
        '',
        '## Rate Limiting & Throttling',
        '- Global limit: **120 requests/minute** per IP across all endpoints.',
        '- Authentication sensitive endpoints (`/auth/login`, `/auth/register`, `/auth/verify-email`, etc.): **5 to 20 requests/minute**.',
        '- AI and TTS generation endpoints: **20 requests/minute**.',
        '',
        '## HTTP Status Code Conventions',
        '- `200 OK`: Successful retrieval or execution.',
        '- `201 Created`: Resource successfully created.',
        '- `400 Bad Request`: Validation failure or unsupported pack parameter.',
        '- `401 Unauthorized`: Missing or invalid session cookie.',
        '- `403 Forbidden`: Email unverified or resource belongs to another user.',
        '- `404 Not Found`: Resource does not exist.',
        '- `429 Too Many Requests`: Exceeded rate limit window.',
        '- `503 Service Unavailable`: Database or underlying service readiness check failure.'
      ].join('\n')
    )
    .setVersion('1.0.0')
    .addCookieAuth('exam_one_access', {
      type: 'apiKey',
      in: 'cookie',
      name: 'exam_one_access',
      description: 'HTTP-only JWT access token cookie set during login or registration',
    })
    .addApiKey(
      {
        type: 'apiKey',
        in: 'header',
        name: 'x-exam-pack',
        description: 'Target exam pack identifier (e.g. goethe-de-a2). Resolves to active user setting if omitted.',
      },
      'x-exam-pack'
    )
    .addTag('health', 'Service liveness and database connectivity readiness checks')
    .addTag('auth', 'Authentication, registration, email verification, session refresh, and password recovery')
    .addTag('users', 'User profile management')
    .addTag('settings', 'Learning settings, exam level, and active exam pack preferences')
    .addTag('exercises', 'Skill practice catalog and user-generated practice exercises')
    .addTag('attempts', 'Skill practice attempt submissions, scoring, and historical records')
    .addTag('drafts', 'Draft management for ongoing exercise and writing sessions')
    .addTag('llm', 'LLM provider connectivity, exercise generation, model answers, automated grading, and mock reviews')
    .addTag('tts', 'Kokoro Text-to-Speech synthesis and audio file lifecycle management')
    .addTag('stt', 'Parakeet Speech-to-Text audio transcription service')
    .addTag('mock-exam', 'Mock exam sets, full-module attempts, grading states, and drafts')
    .addTag('jobs', 'Background jobs (exercise generation, listening audio, mock exam sets) with live SSE updates')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'exam.one API Documentation',
  })
}
