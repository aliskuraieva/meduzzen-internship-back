import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHealthCheck() {
    return {
      status_code: 200,
      detail: 'ok',
      result: 'working',
    };
  }
}
