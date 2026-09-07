import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { appConfig } from './config/app.config'
import { CoreModule } from './core/core.module'
import { UsersModule } from './users/users.module'
import { PracticeModule } from './practice/practice.module'
import { AiModule } from './ai/ai.module'
import { SpeechModule } from './speech/speech.module'
import { MockExamModule } from './mock-exam/mock-exam.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: ['../../.env', '.env'],
    }),
    CoreModule,
    UsersModule,
    PracticeModule,
    AiModule,
    SpeechModule,
    MockExamModule,
  ],
})
export class AppModule {}
