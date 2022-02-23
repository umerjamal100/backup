import {Test, TestingModule} from '@nestjs/testing';
import {EventsGatewayService} from './events-gateway.service';

describe('EventsGatewayService', () => {
  let service: EventsGatewayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventsGatewayService],
    }).compile();

    service = module.get<EventsGatewayService>(EventsGatewayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
