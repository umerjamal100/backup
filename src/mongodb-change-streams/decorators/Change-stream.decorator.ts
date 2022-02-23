import {ChangeType, SubscriptionInterface} from '../interfaces/class.decorator.interface';
import {MongoStreams} from '../interfaces/reflect.constants';


export function MongoChangeStream<T extends {new(...args: any[]): any}>(constructor: T) {
  return class extends constructor {
    constructor(...args: any[]) {
      super(...args);
      this.init(args);
    }

    async init(...args: any[]) {
      const subscriptions: Array<() => SubscriptionInterface> = Reflect.getMetadata(MongoStreams.SUBSCRIBE_STREAM, constructor.prototype);
      for (const subscriptionCb of subscriptions) {
        const subscription = subscriptionCb()
        if (subscription.stream === ChangeType.DELETE) {
          const dStream = await this.deleteStream(subscription.collection);
          dStream.on('change', (data) => this[subscription.descriptorName](data));
        } else {
          const changeStream = await this.changesStream(subscription.collection, subscription.stream);
          // subscription.descriptor.value.bind(constructor);
          changeStream.on('change', (data) => this[subscription.descriptorName](data));
        }
      }
    }

  };
}
