import {Inject, Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {CartModelInterface, CartModelStructure} from '../schemas/cart.schema';
import {Model} from 'mongoose';
import {DeleteFromCartDTO, UpdateCartDTO,} from './types/dto/cart.dto';
import {AddressHelper} from '../helpers/address.helper';
import {CartCheckoutInterface, CreateCartInterface} from './types/interfaces/cart.interface';
import {MESSAGE_PATTERNS, MICRO_SERVICE_INJECTION_TOKEN} from '../common/constants.common';
import {ClientProxy} from '@nestjs/microservices';
import {CartHelper} from './helpers/cart.helper';
import {CartPopulatedWithProductRes} from './interfaces/cart.interface';
import {User} from '../schemas/interfaces/user.interface';

@Injectable()
export class CartService {
  constructor(
    @InjectModel('Cart')
    private readonly cartModel: Model<CartModelStructure>,
    private readonly addressHelper: AddressHelper,
    @Inject(MICRO_SERVICE_INJECTION_TOKEN.ORDER)
    private client: ClientProxy,
    private readonly cartHelper: CartHelper,
  ) {
  }

  // TODO secure IDOR for prescriptions
  async create(cart: CreateCartInterface): Promise<CartModelInterface> {
    if (cart.shipmentAddress) {
      const address = this.addressHelper.transformAddressFromDTO(cart.shipmentAddress);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      cart.shipmentAddress = address;
    }
    try {
      const newCart = (await new this.cartModel(cart).save()).toObject();
      return newCart;
    } catch (e) {
      console.error(e);
    }
  }

  // TODO secure for IDOR
  // TODO secure IDOR for prescriptions
  // TODO calculate total when adding item
  async update(cart: UpdateCartDTO): Promise<CartModelStructure> {
    let address: any;
    if (cart.shipmentAddress) {
      address = this.addressHelper.transformAddressFromDTO(cart.shipmentAddress);
    }
    try {
      const newCart = await this.cartModel.findOneAndUpdate({
        _id: cart.cartId,
      }, {
        $set: {
          products: cart.products,
          prescriptions: cart.prescriptions,
          shipmentAddress: address,
        },
      }, {upsert: true, lean: true, new: true});
      return newCart;
    } catch (e) {
      console.error(e);
    }
  }

  async delete(cart: DeleteFromCartDTO): Promise<CartModelInterface> {
    try {
      const newCart = await this.cartModel.findOneAndUpdate({
        _id: cart.cartId,
      }, {
        $pull: {
          products: {productId: {$in: cart.products ?? []}},
          prescriptions: {prescriptionId: {$in: cart.prescriptions ?? []}},
        },
      }, {new: true, lean: true});
      return newCart;
    } catch (e) {
      console.error(e);
    }
  }

  async findOneById(cartId: string): Promise<CartModelInterface> {
    try {
      const cart = await this.cartModel.findOne({_id: cartId}).lean();
      return cart;
    } catch (e) {
      console.error(e);
    }
  }

  async findOne(where: any): Promise<CartPopulatedWithProductRes> {
    try {
      const cart = await this.cartModel.findOne(where)
        .populate('products.productId')
        .populate('prescriptions.prescriptionId')
        .lean();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return this.cartHelper.transformProdIds(cart);
      // return cart;
    } catch (e) {
      console.error(e);
    }
  }

  async confirmCart(cartId: string, user: User): Promise<CartCheckoutInterface> {
    try {
      //todo: *cart already CONFIRMED will not be checkout
      const confirmedCart = await this.cartModel.findOneAndUpdate({_id: cartId}, {
        status: 'CONFIRMED',
      }, {lean: true, new: true});
      if (confirmedCart)
        return this.client.send(MESSAGE_PATTERNS.CHECKOUT_CART, {cart: confirmedCart, user}).toPromise();
      // return confirmed;
    } catch (e) {
      console.error(e);
    }
  }
}
