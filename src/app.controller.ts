import { Controller, Get, HttpStatus } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHealthCheck() {
    return {
      status_code: HttpStatus.OK,
      detail: 'ok',
      result: 'working',
    };
  }

  @Get('not-found')
  getNotFound() {
    return {
      status_code: HttpStatus.NOT_FOUND,
      detail: 'not found',
      result: 'error',
    };
  }
}
