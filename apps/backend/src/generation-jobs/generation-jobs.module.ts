import { Module } from '@nestjs/common'
import { GenerationJobsController } from './generation-jobs.controller'
import { GenerationJobsService } from './generation-jobs.service'

@Module({
  controllers: [GenerationJobsController],
  providers: [GenerationJobsService],
  exports: [GenerationJobsService],
})
export class GenerationJobsModule {}
