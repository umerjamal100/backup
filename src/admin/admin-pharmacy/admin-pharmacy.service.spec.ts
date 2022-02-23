import {Test, TestingModule} from '@nestjs/testing';
import {AdminPharmacyService} from './admin-pharmacy.service';

describe('AdminPharmacyService', () => {
  let service: AdminPharmacyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminPharmacyService],
    }).compile();

    service = module.get<AdminPharmacyService>(AdminPharmacyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
