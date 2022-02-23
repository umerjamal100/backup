import {FamilyModelInterface} from '../../../schemas/family.schema';
import {PatchProfileDTO} from '../../../users/types/dto/user.dto';
import {PrescriptionModelStructure} from '../../../schemas/prescription.schema';

export type PatchUser = {
  email: string;
  firstName: string;
  lastName: string;
  profilePic: string;
  emiratesIdPic: string;
  emiratesId: string;
  healthCardPic: string;
}

// export type Relations = FamilyModelStructure;

export type UserDocs = PatchProfileDTO & {
  relations: FamilyModelInterface[];
  prescriptions: PrescriptionModelStructure[];
  _id: string;
};
