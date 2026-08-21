import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { configureApp } from './bootstrap'

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule)
  configureApp(app)

  const configService = app.get(ConfigService)
  const port = configService.get<number>('app.BACKEND_PORT', 3001)
  await app.listen(port)

  const logger = new Logger('Bootstrap')
  logger.log(`Backend ready at http://localhost:${port}`)
  logger.log(`Liveness: http://localhost:${port}/api/v1/health`)
  logger.log(`Readiness: http://localhost:${port}/api/v1/health/ready`)
}

void bootstrap()
