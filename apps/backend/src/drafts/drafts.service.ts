import { Injectable } from '@nestjs/common'
import { PrismaService } from '@exam-one/nestjs-libraries'

@Injectable()
export class DraftsService {
  constructor(private readonly prisma: PrismaService) {}

  count(): Promise<number> {
    return this.prisma.draft.count()
  }
}
