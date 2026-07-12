import { Controller, Get } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse as ApiResponseDoc } from '@nestjs/swagger'
import type { ApiResponse } from '@exam-one/contracts'

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Health check' })
  @ApiResponseDoc({ status: 200, description: 'Service is healthy' })
  check(): ApiResponse<{ status: string; service: string }> {
    return { data: { status: 'ok', service: 'exam.one-backend' } }
  }
}
