import { Injectable } from '@nestjs/common'
import { PrismaService } from '@exam-one/nestjs-libraries'

@Injectable()
export class ExercisesService {
  constructor(private readonly prisma: PrismaService) {}

  count(): Promise<number> {
    return this.prisma.exercise.count()
  }
}
