import { Module } from '@nestjs/common'
import { AttemptsService } from './attempts.service'

@Module({
  providers: [AttemptsService],
  exports: [AttemptsService],
})
export class AttemptsModule {}
