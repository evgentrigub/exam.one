import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import type {
  ApiResponse,
  PracticeImportResultDto,
  PracticeMigrationStatusDto,
} from '@exam-one/contracts'
import type { User } from '@exam-one/database'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { PracticeImportDto } from './dto/import.dto'
import { ImportService } from './import.service'

@ApiTags('import')
@Controller('me')
export class ImportController {
  constructor(private readonly imports: ImportService) {}

  @Get('migrations')
  @ApiOperation({ summary: 'List practice domains already imported for this user' })
  async status(@CurrentUser() user: User): Promise<ApiResponse<PracticeMigrationStatusDto>> {
    const data = await this.imports.status(user)
    return { data }
  }

  @Post('import/:domain/skip')
  @ApiOperation({ summary: 'Skip localStorage import for a domain' })
  async skip(
    @CurrentUser() user: User,
    @Param('domain') domain: string
  ): Promise<ApiResponse<PracticeImportResultDto>> {
    const data = await this.imports.skip(user, this.imports.parseDomain(domain))
    return { data }
  }

  @Post('import/:domain')
  @ApiOperation({ summary: 'Import leftover localStorage practice data once' })
  async importDomain(
    @CurrentUser() user: User,
    @Param('domain') domain: string,
    @Body() dto: PracticeImportDto
  ): Promise<ApiResponse<PracticeImportResultDto>> {
    const data = await this.imports.import(user, this.imports.parseDomain(domain), dto.entries)
    return { data }
  }
}
