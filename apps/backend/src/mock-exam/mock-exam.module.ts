import { Module } from '@nestjs/common'
import { GenerationJobsModule } from '../generation-jobs/generation-jobs.module'
import { MockExamController } from './mock-exam.controller'
import { MockExamService } from './mock-exam.service'

@Module({
  imports: [GenerationJobsModule],
  controllers: [MockExamController],
  providers: [MockExamService],
  exports: [MockExamService],
})
export class MockExamModule {}
