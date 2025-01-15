import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { HealthCheckResponseDto } from './dto/health-check-response.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHealthCheck(): Promise<HealthCheckResponseDto> {
    const healthCheckResponse = await this.appService.getHealthCheck();
    await AppService.logHealthCheckStatus();
    return healthCheckResponse;
  }
}
