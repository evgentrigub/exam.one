import { Module } from '@nestjs/common'
import { AttemptsModule } from '../attempts/attempts.module'
import { DraftsModule } from '../drafts/drafts.module'
import { ExercisesModule } from '../exercises/exercises.module'
import { GenerationJobsModule } from '../generation-jobs/generation-jobs.module'
import { MockExamModule } from '../mock-exam/mock-exam.module'
import { ImportController } from './import.controller'
import { ImportService } from './import.service'

@Module({
  imports: [
    ExercisesModule,
    AttemptsModule,
    DraftsModule,
    GenerationJobsModule,
    MockExamModule,
  ],
  controllers: [ImportController],
  providers: [ImportService],
  exports: [ImportService],
})
export class ImportModule {}
