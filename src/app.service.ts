import { Injectable, HttpException, Logger } from '@nestjs/common';
import { HealthCheckResponseDto } from './dto/health-check-response.dto';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  public async getHealthCheck(): Promise<HealthCheckResponseDto> {
    return {
      status_code: 200,
      detail: 'ok',
      result: 'working',
    };
  }

  public async logHealthCheckStatus(): Promise<void> {
    this.logger.log('Health check is working');
  }

  private async handleError(): Promise<void> {
    throw new HttpException('Forbidden', 403);
  }
}
