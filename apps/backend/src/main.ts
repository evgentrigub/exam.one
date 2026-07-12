import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { configureApp } from './bootstrap'

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule)
  configureApp(app)

  const configService = app.get(ConfigService)
  const port = configService.get<number>('app.PORT', 3000)
  await app.listen(port)
}

void bootstrap()
