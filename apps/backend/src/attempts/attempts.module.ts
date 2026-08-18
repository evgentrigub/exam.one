import { Module } from '@nestjs/common'
import { ExercisesModule } from '../exercises/exercises.module'
import { AttemptsController } from './attempts.controller'
import { AttemptsService } from './attempts.service'

@Module({
  imports: [ExercisesModule],
  controllers: [AttemptsController],
  providers: [AttemptsService],
  exports: [AttemptsService],
})
export class AttemptsModule {}
