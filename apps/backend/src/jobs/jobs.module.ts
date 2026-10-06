import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { BullModule } from '@nestjs/bullmq'
import { BullBoardModule } from '@bull-board/nestjs'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { ExpressAdapter } from '@bull-board/express'
import { AiModule } from '../ai/ai.module'
import { MockExamModule } from '../mock-exam/mock-exam.module'
import { PracticeModule } from '../practice/practice.module'
import { SpeechModule } from '../speech/speech.module'
import { BackgroundJobsService } from './background-jobs.service'
import { JobEventsService } from './job-events.service'
import { JobReconcilerService } from './job-reconciler.service'
import { JobsController } from './jobs.controller'
import { ListeningAudioProcessor } from './processors/listening-audio.processor'
import { ExerciseGenerationProcessor } from './processors/exercise-generation.processor'
import { MockExamProcessor } from './processors/mock-exam.processor'
import { protectBoard } from './bull-board'
import { QUEUE_NAMES } from './queues'

@Global()
@Module({
  imports: [
    AiModule,
    MockExamModule,
    PracticeModule,
    SpeechModule,
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = new URL(config.getOrThrow<string>('app.REDIS_URL'))
        return { connection: {
          host: url.hostname, port: Number(url.port || 6379),
          ...(url.username ? { username: decodeURIComponent(url.username) } : {}),
          ...(url.password ? { password: decodeURIComponent(url.password) } : {}),
          db: Number(url.pathname.slice(1) || 0),
          ...(url.protocol === 'rediss:' ? { tls: {} } : {}),
          maxRetriesPerRequest: null,
        } }
      },
    }),
    ...Object.values(QUEUE_NAMES).map(name => BullModule.registerQueue({ name })),
    BullBoardModule.forRoot({ route: '/admin/queues', adapter: ExpressAdapter, middleware: protectBoard }),
    ...Object.values(QUEUE_NAMES).map(name => BullBoardModule.forFeature({ name, adapter: BullMQAdapter })),
  ],
  controllers: [JobsController],
  providers: [
    JobEventsService,
    BackgroundJobsService,
    JobReconcilerService,
    ...(process.env['JOBS_WORKER_ENABLED'] === 'false'
      ? [] : [ListeningAudioProcessor, ExerciseGenerationProcessor, MockExamProcessor]),
  ],
  exports: [JobEventsService, BackgroundJobsService],
})
export class JobsModule {}
