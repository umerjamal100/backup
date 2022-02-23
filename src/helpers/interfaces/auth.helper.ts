import {IDP} from '../../auth/types/interfaces/auth.interface';

export interface IDPProfileInterface {
  email: string;
  firstName: string;
  lastName: string;
  userId: string;
  IDP: IDP;
  profile: string;
}