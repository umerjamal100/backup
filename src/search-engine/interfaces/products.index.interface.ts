import {ConfigService} from '../../config/config.service';

let service = new ConfigService();

export interface ProductsIndexInterface {
  packageName: string;
  symptoms: string[];
  salts: string[];
  manufacturer: string;
  pharmacy: string;
  pharmacyId: string;
  productId: string;
  type: string
}

export const ProductIndex = {
  PRODUCT_SEARCH: 'product_search_' + service.nodeEnv,
  PRODUCT_SUGGEST: 'product_suggest_' + service.nodeEnv
}