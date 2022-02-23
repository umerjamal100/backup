import {Injectable} from '@nestjs/common';
import {GetItemsDTO} from '../product/types/dto/product.dto';
import {InjectModel} from '@nestjs/mongoose';
import {ProductModelInterface, ProductModelStructure} from '../schemas/product.schema';
import {Model} from 'mongoose';

import {PharmacyModelInterface} from '../schemas/pharmacy.schema';
import {NearestPharmacyInterface} from '../pharmacy/types/interfaces/pharmacy.interface';
import {NearestPharmacyProductInterface} from '../product/types/interfaces/product.interface';
import {ProductType, Symptoms} from "../schemas/interfaces/products.interface";

@Injectable()
export class ProductHelper {
  constructor(
    @InjectModel('Product')
    private readonly productModel: Model<ProductModelStructure>,
  ) {
  }

  getItemQuery(query: {isDiscount?: boolean, min?: number, max?: number, name?: string, price?: string, lastPrice?: number, lastName?: string, salts?: string, pharmacyId?: string, search?: string; cursor?: string; limit?: number, internalIds: string[], productType?: ProductType, symptoms?: Symptoms}) {
    let where: any = {}
    const sort: any = {}
    if (query.search)
      where['internalId'] = {$in: query.internalIds};
    if (query.productType)
      where['productType'] = query.productType
    if (query.symptoms)
      where['symptoms'] = {$in: [query.symptoms]}
    if (query.salts)
      where['salts'] = {$in: [query.salts]}
    if (query.pharmacyId)
      where['pharmacyId'] = query.pharmacyId
    if (query.cursor) {
      where['_id'] = {$gt: query.cursor};
    }
    if (query.isDiscount) {
      where['discount'] = query.isDiscount;
    }
    if (query.price) {
      sort['packagePrice'] = query.price
      let packagePricePaginationQuery
      if (query.price === 'asc') {
        if (query.cursor)
          where['_id'] = {$gt: query.cursor};
        packagePricePaginationQuery = [
          {packagePrice: {$gt: query.lastPrice || 0}},
          {
            packagePrice: query.lastPrice || 0,
            _id: {$gt: query.cursor}
          }
        ]
      }
      if (query.price === 'desc') {
        if (query.cursor)
          where['_id'] = {$lt: query.cursor};
        packagePricePaginationQuery = [
          {packagePrice: {$lt: query.lastPrice || 999999}},
          {
            packagePrice: query.lastPrice || 999999,
            _id: {$lt: query.cursor}
          }
        ]
      }
      if (Object.keys(where).length === 0)
        where['$or'] = packagePricePaginationQuery
      else {
        let query = where
        where = {}
        where['$and'] = [
          {
            $or: [
              query
            ]
          }, {
            $or: packagePricePaginationQuery
          }
        ]
      }
    }
    if (query.name) {
      sort['packageName'] = query.name
      let packagePricePaginationQuery
      if (query.name === 'asc') {
        if (query.cursor)
          where['_id'] = {$gt: query.cursor};
        packagePricePaginationQuery = [
          {packageName: {$gt: query.lastName || 0}},
          {
            packageName: query.lastName || 0,
            _id: {$gt: query.cursor}
          }
        ]
      }
      if (query.name === 'desc') {
        if (query.cursor)
          where['_id'] = {$lt: query.cursor};
        packagePricePaginationQuery = [
          {packageName: {$lt: query.lastName || 'zz'}},
          {
            packageName: query.lastName || 'zz',
            _id: {$lt: query.cursor}
          }
        ]
      }
      if (Object.keys(where).length === 0)
        where['$or'] = packagePricePaginationQuery
      else {
        let condition = where
        where = {}
        where['$and'] = [
          {
            $or: [
              condition
            ]
          }, {
            $or: packagePricePaginationQuery
          }
        ]
      }
    }

    if (query.min && query.max) {
      let condition = where
      where = {}
      where['$and'] = [
        condition,
        {packagePrice: {$lte: Number(query.max), $gte: Number(query.min)}}
      ]
    }
    return {where, sort};
  }


  getProdsByPharmacyIdQueryMaker(query: {pharmacyId?: string} & GetItemsDTO) {

    let where: any;
    if (query.pharmacyId && query.category) {
      where = {
        pharmacyId: {$in: query.pharmacyId},
        category: query.category
      };
    } else if (query.pharmacyId && !query.category) {
      where = {
        pharmacyId: query.pharmacyId,
      }
    } else if (!query.pharmacyId && query.category) {
      where = {
        category: query.category
      }
    }
    if (query.cursor)
      where['_id'] = {$gt: query.cursor};
    return where;
  }

  mapAndSortProducts(pharmacies: NearestPharmacyInterface[], products: ProductModelInterface[]) {
    return (products.map((prod: ProductModelInterface) => {
      prod.pharmacy = pharmacies.find((pharmacy: PharmacyModelInterface) => pharmacy['_id'].toString() === prod.pharmacyId['_id'].toString());
      delete prod.pharmacyId;
      return prod;
    }) as NearestPharmacyProductInterface[]);
  }
}