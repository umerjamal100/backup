import {CallHandler, ExecutionContext, Injectable, NestInterceptor} from '@nestjs/common';
import {RedisService} from 'nestjs-redis';
import {Observable} from 'rxjs';

@Injectable()
export class SubOrdersCacheMiddleware implements NestInterceptor {
  constructor(
    private readonly redisService: RedisService
  ) {
  }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    console.log('Before...');
    const req = context.getArgs()[0];
    const body = req.body;
    const pharmacy = req.user?._id.toString();
    if (!body.isAccepted) {
      return next
        .handle()
    } else {

    }
  }

  async getOrderFromCache(orderId, pharmacy) {
    try {
      const client = await this.redisService.getClient();
      const cached = await client.get(orderId);

    } catch (e) {
      console.error(e);
    }
  }
}