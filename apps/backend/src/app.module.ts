import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { PrismaModule } from '@exam-one/nestjs-libraries'
import { appConfig } from './config/app.config'
import { JwtAuthGuard } from './common/guards/jwt-auth.guard'
import { EmailModule } from './email/email.module'
import { LlmModule } from './llm/llm.module'
import { AiModule } from './ai/ai.module'
import { TtsModule } from './tts/tts.module'
import { SttModule } from './stt/stt.module'
import { AuthModule } from './auth/auth.module'
import { HealthModule } from './health/health.module'
import { UsersModule } from './users/users.module'
import { SettingsModule } from './settings/settings.module'
import { ExercisesModule } from './exercises/exercises.module'
import { AttemptsModule } from './attempts/attempts.module'
import { ResultsModule } from './results/results.module'
import { DraftsModule } from './drafts/drafts.module'
import { GenerationJobsModule } from './generation-jobs/generation-jobs.module'
import { MockExamModule } from './mock-exam/mock-exam.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: ['../../.env', '.env'],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 120,
      },
    ]),
    PrismaModule,
    EmailModule,
    LlmModule,
    AiModule,
    TtsModule,
    SttModule,
    AuthModule,
    HealthModule,
    UsersModule,
    SettingsModule,
    ExercisesModule,
    AttemptsModule,
    ResultsModule,
    DraftsModule,
    GenerationJobsModule,
    MockExamModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
