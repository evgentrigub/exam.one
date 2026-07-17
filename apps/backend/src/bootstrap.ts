import { ValidationPipe, VersioningType, type INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { RequestIdInterceptor } from './common/interceptors/request-id.interceptor'

export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix('api')
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' })
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  app.useGlobalInterceptors(new RequestIdInterceptor())
  app.enableCors({ origin: process.env['FRONTEND_URL'] ?? true })

  const config = new DocumentBuilder()
    .setTitle('exam.one API')
    .setDescription('Backend API for exam.one')
    .setVersion('0.0.1')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document)
}
