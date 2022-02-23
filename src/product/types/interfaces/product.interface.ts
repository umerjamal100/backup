import {ProductModelInterface} from '../../../schemas/product.schema';
import {NearestPharmacyInterface} from '../../../pharmacy/types/interfaces/pharmacy.interface';

export interface FindProductsOptions {
  populatePharmacy: boolean;
}

export interface NearestPharmacyProductInterface extends Omit<ProductModelInterface, 'pharmacy'> {
  pharmacy: NearestPharmacyInterface
}

export interface PharmacyProductObjectInterface {
  [key: string]: {
    products?: Array<ProductModelInterface>;
    distance: number;
  }
}

export interface ProductQuantityInterface {
  productId: string,
  quantity: number
}