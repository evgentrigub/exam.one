import { Body, Controller, Get, Patch } from '@nestjs/common'
import { ApiCookieAuth, ApiOperation, ApiResponse as ApiResponseDoc, ApiTags } from '@nestjs/swagger'
import type { ApiResponse, UserDto } from '@exam-one/contracts'
import type { User } from '@exam-one/database'
import { CurrentUser } from '../core/decorators/current-user.decorator'
import { ApiErrorDto, UserResponseDto } from '../core/dto/api-response.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UsersService } from './users.service'

@ApiTags('users')
@ApiCookieAuth('exam_one_access')
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Retrieves profile details of the authenticated user including ID, name, email, exam target date, and plan.',
  })
  @ApiResponseDoc({ status: 200, description: 'Current user profile', type: UserResponseDto })
  @ApiResponseDoc({ status: 401, description: 'Unauthorized', type: ApiErrorDto })
  me(@CurrentUser() user: User): ApiResponse<UserDto> {
    return { data: this.users.getMe(user) }
  }

  @Patch('me')
  @ApiOperation({
    summary: 'Update current user profile',
    description: 'Updates mutable fields on the current user profile (name, email, exam target date).',
  })
  @ApiResponseDoc({ status: 200, description: 'Updated user profile', type: UserResponseDto })
  @ApiResponseDoc({ status: 400, description: 'Validation error', type: ApiErrorDto })
  @ApiResponseDoc({ status: 401, description: 'Unauthorized', type: ApiErrorDto })
  async updateMe(
    @CurrentUser() user: User,
    @Body() dto: UpdateUserDto
  ): Promise<ApiResponse<UserDto>> {
    const data = await this.users.updateMe(user, dto)
    return { data }
  }
}
