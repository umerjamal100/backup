import {PharmacyModelInterface} from '../pharmacy.schema';
import {UserRole} from '../../common/enum.common';

export interface PharmacyUser extends PharmacyModelInterface {
  role: UserRole
  _id: string;
}