import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from '../app.service';
import { HealthCheckResponseDto } from './health-check-response.dto';

@ApiTags('health')
@Controller()
export class HealthCheckController {
  constructor(private readonly appService: AppService) {}
  @Get()
  @ApiResponse({
    status: 200,
    description: 'Health check passed',
    type: HealthCheckResponseDto,
  })
  public async getHealthCheck(): Promise<HealthCheckResponseDto> {
    try {
      return await this.appService.getHealthCheck();
    } catch (error) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
  }
  @Get('handle-error')
  public async handleError(): Promise<void> {
    throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }
}
