import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from '@exam-one/nestjs-libraries'
import { appConfig } from './config/app.config'
import { HealthModule } from './health/health.module'
import { UsersModule } from './users/users.module'
import { SettingsModule } from './settings/settings.module'
import { ExercisesModule } from './exercises/exercises.module'
import { AttemptsModule } from './attempts/attempts.module'
import { ResultsModule } from './results/results.module'
import { DraftsModule } from './drafts/drafts.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: ['../../.env', '.env']
    }),
    PrismaModule,
    HealthModule,
    UsersModule,
    SettingsModule,
    ExercisesModule,
    AttemptsModule,
    ResultsModule,
    DraftsModule
  ]
})
export class AppModule {}
