import {ProductModelStructure} from '../../schemas/product.schema';
import {Injectable} from '@nestjs/common';

@Injectable()
export class Utils {
  /**
   * tis function transform data for elastic search indexing
   * @param data
   */
  transform(data: ProductModelStructure) {
    return {
      packageName: data.packageName,
      salts: data.salts,
      symptoms: data.symptoms,
      manufacturer: data.manufacturer,
      pharmacy: data.pharmacy,
      pharmacyId: data.pharmacyId,
      productId: data._id,
      internalId: data.internalId,
      category: data.category,
      type: data.productType
    }
  }

}