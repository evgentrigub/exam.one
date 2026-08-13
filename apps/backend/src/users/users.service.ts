import { Injectable } from '@nestjs/common'
import { PrismaService } from '@exam-one/nestjs-libraries'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  count(): Promise<number> {
    return this.prisma.user.count()
  }
}
