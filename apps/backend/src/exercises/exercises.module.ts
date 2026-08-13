import { Module } from '@nestjs/common'
import { ExercisesService } from './exercises.service'

@Module({
  providers: [ExercisesService],
  exports: [ExercisesService],
})
export class ExercisesModule {}
