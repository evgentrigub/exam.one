import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiResponse as ApiResponseDoc, ApiTags } from '@nestjs/swagger'
import { SkipThrottle } from '@nestjs/throttler'
import type { ApiResponse, HealthReadyResponse } from '@exam-one/contracts'
import { HealthLivenessResponseDto, HealthReadyResponseDto } from '../dto/api-response.dto'
import { Public } from '../decorators/public.decorator'
import { HealthService } from './health.service'

@ApiTags('health')
@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Liveness check',
    description:
      'Returns 200 OK when the process is up and running. Does not verify database connectivity.',
  })
  @ApiResponseDoc({
    status: 200,
    description: 'Service process is healthy',
    type: HealthLivenessResponseDto,
  })
  check(): ApiResponse<{ status: string; service: string }> {
    return { data: { status: 'ok', service: 'exam.one-backend' } }
  }

  @Public()
  @Get('ready')
  @ApiOperation({
    summary: 'Readiness check (verifies database connectivity)',
    description:
      'Verifies database connectivity (runs `SELECT 1`). Returns 503 when the database is unreachable or unmigrated.',
  })
  @ApiResponseDoc({
    status: 200,
    description: 'Database connection is healthy and service is ready',
    type: HealthReadyResponseDto,
  })
  @ApiResponseDoc({
    status: 503,
    description: 'Database is down or unmigrated',
    type: HealthReadyResponseDto,
  })
  async ready(): Promise<HealthReadyResponse> {
    const result = await this.health.readiness()
    if (result.data?.status !== 'ok') {
      throw new HttpException(result, HttpStatus.SERVICE_UNAVAILABLE)
    }
    return result
  }
}
