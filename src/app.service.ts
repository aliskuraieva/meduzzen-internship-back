import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HealthCheckResponseDto } from './dto/health-check-response.dto';

@Injectable()
export class AppService {
  public async getHealthCheck(): Promise<HealthCheckResponseDto> {
    return {
      status_code: HttpStatus.OK,
      detail: 'ok',
      result: 'working',
    };
  }

  static async logHealthCheckStatus(): Promise<void> {
    console.log('Health check is working');
  }

  private async handleError(): Promise<void> {
    throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }
}
