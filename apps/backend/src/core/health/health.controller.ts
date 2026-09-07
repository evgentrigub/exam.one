import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse as ApiResponseDoc } from '@nestjs/swagger'
import { SkipThrottle } from '@nestjs/throttler'
import type { ApiResponse, HealthReadyResponse } from '@exam-one/contracts'
import { Public } from '../decorators/public.decorator'
import { HealthService } from './health.service'

@ApiTags('health')
@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Liveness check' })
  @ApiResponseDoc({ status: 200, description: 'Service is healthy' })
  check(): ApiResponse<{ status: string; service: string }> {
    return { data: { status: 'ok', service: 'exam.one-backend' } }
  }

  @Public()
  @Get('ready')
  @ApiOperation({ summary: 'Readiness check (verifies database connectivity)' })
  @ApiResponseDoc({ status: 200, description: 'Readiness result' })
  @ApiResponseDoc({ status: 503, description: 'Database is down or unmigrated' })
  async ready(): Promise<HealthReadyResponse> {
    const result = await this.health.readiness()
    if (result.data?.status !== 'ok') {
      throw new HttpException(result, HttpStatus.SERVICE_UNAVAILABLE)
    }
    return result
  }
}
