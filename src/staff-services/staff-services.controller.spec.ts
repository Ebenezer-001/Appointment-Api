import { Test, TestingModule } from '@nestjs/testing';
import { StaffServicesController } from './staff-services.controller';

describe('StaffServicesController', () => {
  let controller: StaffServicesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StaffServicesController],
    }).compile();

    controller = module.get<StaffServicesController>(StaffServicesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
