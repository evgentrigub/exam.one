import { Module } from '@nestjs/common'
import { ExercisesController } from './exercises.controller'
import { ExercisesService } from './exercises.service'
import { AttemptsController } from './attempts.controller'
import { AttemptsService } from './attempts.service'
import { DraftsController } from './drafts.controller'
import { DraftsService } from './drafts.service'
import { ResultsService } from './results.service'

@Module({
  controllers: [ExercisesController, AttemptsController, DraftsController],
  providers: [ExercisesService, AttemptsService, DraftsService, ResultsService],
  exports: [ExercisesService, AttemptsService, DraftsService, ResultsService],
})
export class PracticeModule {}
