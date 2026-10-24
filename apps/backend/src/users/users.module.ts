import { Module } from '@nestjs/common'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'
import { SettingsController } from './settings.controller'
import { SettingsService } from './settings.service'

@Module({
  controllers: [UsersController, SettingsController],
  providers: [UsersService, SettingsService],
  exports: [UsersService, SettingsService],
})
export class UsersModule {}
