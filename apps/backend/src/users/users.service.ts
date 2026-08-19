import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import type { UserDto } from '@exam-one/contracts'
import type { User } from '@exam-one/database'
import { PrismaService } from '@exam-one/nestjs-libraries'
import { toUserDto } from '../common/mappers/user.mapper'
import type { UpdateUserDto } from './dto/update-user.dto'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  count(): Promise<number> {
    return this.prisma.user.count()
  }

  getMe(user: User): UserDto {
    return toUserDto(user)
  }

  async updateMe(user: User, dto: UpdateUserDto): Promise<UserDto> {
    const data: {
      name?: string
      email?: string
      examTargetDate?: Date | null
      emailVerified?: boolean
    } = {}

    if (dto.name !== undefined) {
      data.name = dto.name.trim()
    }

    if (dto.email !== undefined) {
      const email = dto.email.trim().toLowerCase()
      if (email !== user.email) {
        const taken = await this.prisma.user.findUnique({ where: { email } })
        if (taken) {
          throw new ConflictException({
            code: 'EMAIL_TAKEN',
            message: 'An account with this email already exists',
          })
        }
        data.email = email
        data.emailVerified = false
      }
    }

    if (dto.examTargetDate !== undefined) {
      data.examTargetDate = dto.examTargetDate ? new Date(dto.examTargetDate) : null
    }

    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data,
    })
    return toUserDto(updated)
  }

  async findById(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) {
      throw new NotFoundException({ code: 'USER_NOT_FOUND', message: 'User not found' })
    }
    return user
  }
}
