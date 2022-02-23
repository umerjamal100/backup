import {Injectable} from '@nestjs/common';
import {PopulatedProductCart} from '../interfaces/cart.interface';

@Injectable()
export class CartHelper {
  transformProdIds(data: PopulatedProductCart): any {
    const prods = data.products.map(prod => {
      const id = prod.productId._id;
      const data = prod.productId;
      delete prod.productId;
      return {
        quantity: prod.quantity,
        productId: id,
        details: data,
      };

    });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    data.products = prods;
    return data;
  }
}