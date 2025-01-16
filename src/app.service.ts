import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { HealthCheckResponseDto } from './dto/health-check-response.dto';
import { ForbiddenException } from './exceptions/forbidden.exception';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  public async getHealthCheck(): Promise<HealthCheckResponseDto> {
    return {
      status_code: HttpStatus.OK,
      detail: 'ok',
      result: 'working',
    };
  }

  public async logHealthCheckStatus(): Promise<void> {
    this.logger.log('Health check is working');
  }

  private async handleError(): Promise<void> {
    throw new ForbiddenException();
  }
}
