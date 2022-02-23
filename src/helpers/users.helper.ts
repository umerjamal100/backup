import {Injectable} from '@nestjs/common';
import {FamilyModelStructure} from '../schemas/family.schema';
import {User} from '../schemas/interfaces/user.interface';

@Injectable()
export class UsersHelper {

  /**
   *   transform will maps the relationship,
   *   example: if user's relationship is son and is added via his mother(gender: female) or father (gender: male)
   *   @param gender, comes from the gender of user who added the relation
   */

  // TODO remove magic string
  transformRelationship(relatives: User[]): FamilyModelStructure[] {
    return relatives.reduce((allRelatives: any, currentRelative: User) => {
      const relation = currentRelative.relations[0].relationship;
      const relationship = {
        emiratesId: currentRelative.emiratesId,
        profilePic: currentRelative.profilePic,
        emiratesIdPic: currentRelative.emiratesIdPic,
        relationship: relation,
        firstName: currentRelative.firstName,
        lastName: currentRelative.lastName,
        healthCardPic: currentRelative.healthCardIdPic,
      };
      if (relation === 'SON') {
        relationship.relationship = currentRelative.gender === 'MALE' ? 'FATHER' : 'MOTHER';
      }
      return [...allRelatives, relationship];
    }, [] as FamilyModelStructure[]);
  }
}