import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = moduleFixture.get<AppController>(AppController);
  });

  it('should return a health check response', async () => {
    const result = await appController.getHealthCheck();
    expect(result).toEqual({
      status_code: 200,
      detail: 'ok',
      result: 'working',
    });
  });
});
