import {forwardRef, Inject, Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {ProductModelInterface, ProductModelStructure} from '../schemas/product.schema';
import {GetItemsDTO, ProductDTO, ProductSuggestionDTO, SearchAndSortDTO} from './types/dto/product.dto';
import {ResponseUtils} from '../helpers/utils/response.utils';
import {ProductHelper} from '../helpers/product.helper';
import {MESSAGE_PATTERNS, MICRO_SERVICE_INJECTION_TOKEN} from '../common/constants.common';
import {ClientProxy} from '@nestjs/microservices';
import {Hit} from '../search-engine/interfaces/fuzzy-search';
import {FindProductsOptions} from './types/interfaces/product.interface';
import {AddressHelper} from '../helpers/address.helper';
import {PharmacyService} from '../pharmacy/pharmacy.service';
import {NearestPharmacyInterface} from '../pharmacy/types/interfaces/pharmacy.interface';
import {PharmacyModelInterface} from '../schemas/pharmacy.schema';
import * as _ from 'lodash';
import {
  MedicineSymptoms,
  ProductType,
  productTypeArray,
  ProductTypeExtended
} from "../schemas/interfaces/products.interface";
import {ProductTypeExtendedDTO} from "../pharmacy/types/dto/pharmacy.dto";
import {ExtractJwt} from "passport-jwt";
import fromAuthHeaderWithScheme = ExtractJwt.fromAuthHeaderWithScheme;

@Injectable()
export class ProductService {
  constructor(
    @InjectModel('Product')
    private readonly productModel: Model<ProductModelStructure>,
    private readonly responseUtils: ResponseUtils,
    private readonly productHelper: ProductHelper,
    private readonly addressHelper: AddressHelper,
    @Inject(MICRO_SERVICE_INJECTION_TOKEN.ELASTIC_SEARCH) private client: ClientProxy,
    @Inject(forwardRef(() => PharmacyService))
    private readonly pharmacyService: PharmacyService,
  ) {
  }

  async searchByName(name: string): Promise<ProductModelInterface[]> {
    try {
      return await this.productModel.find({name: new RegExp(name)}, {lean: true});
    } catch (e) {
      console.warn(e);
    }
  }

  /**
   * @TODO need to implement pagination and also figure out
   * this suggestion works on prefix
   * @param query
   */
  async autocomplete(query: GetItemsDTO): Promise<any> {
    return this.client.send(MESSAGE_PATTERNS.AUTO_COMPLTEE_SUGGESTIONS, query).toPromise();
  }

  async find(where: any, options: FindProductsOptions): Promise<any> {
    try {
      if (options.populatePharmacy) {
        return this.productModel.find(where)
          .populate('pharmacyId')
          .lean();
      } else {
        return this.productModel.find(where).lean();
      }
    } catch (e) {
      console.error(e);
    }
  }

  async findAndCustomPopulate(where: any, populate: any): Promise<ProductModelInterface[]> {
    try {
      return this.productModel.find(where)
        .populate(populate)
        .lean();
    } catch (e) {
      console.error(e);
    }
  }

  async findOneAndCustomPopulate(find: any, populate: any): Promise<ProductModelInterface> {
    try {
      return this.productModel.findOne(find).populate(populate).lean()
    } catch (e) {
      console.log(e)
    }
  }

  async search(query: GetItemsDTO): Promise<any> {
    const data: Hit[] = await this.client.send(MESSAGE_PATTERNS.KEYWORD_SEARCH, query).toPromise();
    const internalIds = data?.map((hit: Hit) => hit._source.internalId);
    const where = this.productHelper.getItemQuery({...query, internalIds});
    const products = await this.productModel.find(where).limit(query.limit + 1 || 20).lean();
    return this.responseUtils.paginationResponse(products, query.limit || 19);
  }

  /**
   * TODO: sort in elasticsearch
   * @param query
   */
  async searchAndSort(query: SearchAndSortDTO): Promise<any> {
    try {
      const data: Hit[] = await this.client.send(MESSAGE_PATTERNS.KEYWORD_SEARCH, query).toPromise();
      const internalIds = data?.map((hit: Hit) => hit._source.internalId);
      const {where, sort} = this.productHelper.getItemQuery({...query, internalIds});
      const products = await this.productModel.find(where).limit(query.limit + 1 || 20)
        .sort(sort)
        .lean();
      return this.responseUtils.paginationResponse(products, query.limit || 19);
    } catch (e) {
      console.log(e)
    }

  }

  async searchById(_id?: string): Promise<any> {
    try {
      const found = await this.productModel.findOne({_id}).lean();
      return found;
    } catch (e) {
      console.error(JSON.stringify(e));
    }
  }

  async patchProductById(_id: string, product: ProductDTO, user: any): Promise<any> {
    try {
      const found = await this.productModel.findOneAndUpdate({
        _id,
        pharmacyId: user.user.toString()
      }, product, {new: true}).lean();
      return found;
    } catch (e) {
      console.error(JSON.stringify(e));
    }
  }

  async fullTextSearch(text: string): Promise<any> {
    try {
      const found = await this.productModel.find({
        $text: {
          $search: text,
        },
      });
      return found;
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * findAndSort return all products sorted by nearest pharmacy
   * @param internalId
   * @param coordinates
   *
   */
  async findAndSort(drugCodes: string[], coordinate: string | number[], radius = 100000): Promise<any> {

    let coordinates;
    if (typeof coordinate === 'string')
      coordinates = this.addressHelper.toLngLat(coordinate);
    else
      coordinates = coordinate;
    try {
      let products: ProductModelInterface[] = await this.productModel
        .find({
          drugCode: {
            $in: drugCodes,
          },
        })
        .populate({path: 'pharmacyId', match: {'isOnline': true}})
        .lean();
      products = _.reject(products, {pharmacyId: null})
      const pharmacies = products.reduce(function (filtered: PharmacyModelInterface[], prod: ProductModelInterface) {
        let pharmacy = prod.pharmacyId as PharmacyModelInterface
        filtered.push(pharmacy);
        return filtered;
      }, []);
      const sortedPharmacies: NearestPharmacyInterface[] = await this.pharmacyService.shortestRoutes(pharmacies, [this.addressHelper.toString(coordinates)]);
      // handle in other way
      if (!sortedPharmacies.length) {
        return {error: 'NO_Pharmacy'}
      }
      return this.productHelper.mapAndSortProducts(sortedPharmacies, products);
    } catch (e) {
      console.error(e);
    }
  }


  async getSymptoms(param: ProductTypeExtendedDTO): Promise<any> {
    try {
      const {productType} = param
      let where
      switch (productType) {
        case ProductTypeExtended.MEDICINE:
          where = {productType: param.productType}
          break
        case ProductTypeExtended.PRODUCT:
          where = {productType: param.productType}
          break
        case ProductTypeExtended.ALL:
          where = {productType: {$in: productTypeArray}}
          break
      }
      const symptoms = await this.productModel.find(where).distinct('symptoms').lean() as string[];
      if (productType === ProductTypeExtended.ALL)
        return {
          symptoms: symptoms.map(symptom => {
            return {
              symptom,
              type: MedicineSymptoms.includes(symptom) ? ProductType.MEDICINE : ProductType.PRODUCT
            }
          })
        }
      return symptoms;
    } catch (e) {
      console.error(e);
    }
  }

  async getCategories(pharmacyId): Promise<string[]> {
    try {
      const categories = await this.productModel.find({pharmacyId}).distinct('category').lean() as string[];
      return categories;
    } catch (e) {
      console.error(e);
    }
  }

  async getProdsByPharmacyId(pharmacyId: string, query: GetItemsDTO): Promise<any> {
    try {
      const where = this.productHelper.getProdsByPharmacyIdQueryMaker({pharmacyId, ...query});
      const prods = await this.productModel.find(where).limit(query.limit + 1 || 20).lean();
      return this.responseUtils.paginationResponse(prods, query.limit || 19);
    } catch (e) {
      console.error(e);
    }
  }

  // async onModuleInit() {
  //   await this.findAndSort(['c5ee4455-35bb-4205-aef7-31362b9c1661'], '31.4321383,74.2766072');
  // }
  async getProductSuggestion(body: ProductSuggestionDTO): Promise<any> {
    try {
      const {symptoms} = body
      const symptomsArray = symptoms.split(',')
      return this.productModel.aggregate([
        {$match: {symptoms: {$in: symptomsArray}}},
        {$sample: {size: 10}}])
    } catch (e) {
      throw e
    }
  }

  async getProductPrice(id: string) {
    const product = await this.productModel.findById(id)
    return product.getProductPrice()

  }
}
