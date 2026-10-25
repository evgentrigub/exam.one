import { Global, Module } from '@nestjs/common'
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { ThrottlerModule } from '@nestjs/throttler'
import { PrismaModule } from '@exam-one/nestjs-libraries'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { ScaledThrottlerGuard } from './guards/scaled-throttler.guard'
import { PackContextInterceptor } from './interceptors/pack-context.interceptor'
import { AuthModule } from './auth/auth.module'
import { HealthModule } from './health/health.module'
import { EmailModule } from './email/email.module'

@Global()
@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 120,
      },
    ]),
    PrismaModule,
    EmailModule,
    AuthModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: PackContextInterceptor },
    { provide: APP_GUARD, useClass: ScaledThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
  exports: [PrismaModule, EmailModule, AuthModule, HealthModule],
})
export class CoreModule {}
