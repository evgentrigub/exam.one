import { Module } from '@nestjs/common'
import { MockExamController } from './mock-exam.controller'
import { MockExamService } from './mock-exam.service'
import { GenerationJobsController } from './generation-jobs.controller'
import { GenerationJobsService } from './generation-jobs.service'

@Module({
  controllers: [MockExamController, GenerationJobsController],
  providers: [MockExamService, GenerationJobsService],
  exports: [MockExamService, GenerationJobsService],
})
export class MockExamModule {}
