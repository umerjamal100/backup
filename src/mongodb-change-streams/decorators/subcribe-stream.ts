import {MongoStreams} from '../interfaces/reflect.constants';
import {ChangeType, SubscriptionInterface} from '../interfaces/class.decorator.interface';

export function SubscribeStream(options: {collection: string; stream: ChangeType}): MethodDecorator {
  return function (target: any, methodName: string, descriptor: TypedPropertyDescriptor<any>) {

    let subscriptions: Array<() => SubscriptionInterface> = Reflect.getMetadata(MongoStreams.SUBSCRIBE_STREAM, target);
    if (!subscriptions) {
      Reflect.defineMetadata(MongoStreams.SUBSCRIBE_STREAM, subscriptions = [], target);
    }

    subscriptions.push(() => ({
      descriptorName: methodName,
      collection: options.collection,
      stream: options.stream,
    }));
  };
}