import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = module.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return a health check response', () => {
      const result = appController.getHealthCheck();
      expect(result).toEqual({
        status_code: 200,
        detail: 'ok',
        result: 'working',
      });
    });
  });
});
