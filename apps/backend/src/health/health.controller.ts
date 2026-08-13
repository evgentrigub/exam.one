import { Controller, Get } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse as ApiResponseDoc } from '@nestjs/swagger'
import type { ApiResponse, HealthReadyResponse } from '@exam-one/contracts'
import { HealthService } from './health.service'

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Liveness check' })
  @ApiResponseDoc({ status: 200, description: 'Service is healthy' })
  check(): ApiResponse<{ status: string; service: string }> {
    return { data: { status: 'ok', service: 'exam.one-backend' } }
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness check (verifies database connectivity)' })
  @ApiResponseDoc({ status: 200, description: 'Readiness result' })
  ready(): Promise<HealthReadyResponse> {
    return this.health.readiness()
  }
}
