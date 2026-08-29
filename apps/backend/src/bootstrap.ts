import { ValidationPipe, VersioningType, type INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import cookieParser from 'cookie-parser'
import { json, urlencoded } from 'express'
import helmet from 'helmet'
import { RequestIdInterceptor } from './common/interceptors/request-id.interceptor'

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
    .setDescription('Backend API for exam.one')
    .setVersion('0.0.1')
    .addCookieAuth('exam_one_access')
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document)
}
