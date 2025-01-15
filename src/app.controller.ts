import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthCheckResponseDto } from './dto/health-check-response.dto';

@ApiTags('Health Check')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Returns health check status',
    type: HealthCheckResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden access',
  })
  public async getHealthCheck(): Promise<HealthCheckResponseDto> {
    await this.appService.logHealthCheckStatus();
    return await this.appService.getHealthCheck();
  }
}
