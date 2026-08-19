import type { ApiResponse } from '../api/response'

export type HealthCheckState = 'up' | 'down'

export type HealthReadyStatus = 'ok' | 'degraded'

export interface HealthReadyData {
  status: HealthReadyStatus
  checks: {
    database: HealthCheckState
  }
}

export type HealthReadyResponse = ApiResponse<HealthReadyData>
