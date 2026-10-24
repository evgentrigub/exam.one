import { Module } from '@nestjs/common'
import { MockExamController } from './mock-exam.controller'
import { MockExamService } from './mock-exam.service'

@Module({
  controllers: [MockExamController],
  providers: [MockExamService],
  exports: [MockExamService],
})
export class MockExamModule {}
