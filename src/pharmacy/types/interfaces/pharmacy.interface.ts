import {PointModelStructure} from '../../../schemas/address.schema';
import {PharmacyModelInterface} from '../../../schemas/pharmacy.schema';
import {DistanceMatrixRowElement} from '@googlemaps/google-maps-services-js/dist';

export interface CalculatedDistanceInterface {
  calculated: number;
  location: PointModelStructure;
}

export interface NearestPharmacyInterface extends PharmacyModelInterface {
  route?: any;
  dist?: CalculatedDistanceInterface;
}

export interface PharmacyMatrixArray extends PharmacyModelInterface {
  route: DistanceMatrixRowElement
}