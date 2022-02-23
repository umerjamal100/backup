import {Test, TestingModule} from '@nestjs/testing';
import {AdminPharmacyController} from './admin-pharmacy.controller';
import {AdminPharmacyService} from './admin-pharmacy.service';

describe('AdminPharmacyController', () => {
  let controller: AdminPharmacyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminPharmacyController],
      providers: [AdminPharmacyService],
    }).compile();

    controller = module.get<AdminPharmacyController>(AdminPharmacyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
