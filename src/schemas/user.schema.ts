import * as mongoose from 'mongoose';
import {Error} from 'mongoose';
import {UserRole} from '../common/enum.common';
import {AddressSchema} from './address.schema';
import {FamilySchema} from './family.schema';
import {UrlSchema} from "./prescription.schema";
import {cardCode, ISOCountryCodes} from "../users/types/enums/user.enum";


export const UserSchemaProvider = () => {
  // function updateSequenceId(seqName: Collection) {
  //   return sequenceModel.findOneAndUpdate(
  //     {seqName},
  //     {$inc: {nextSeqNumber: 1}},
  //     {new: true, upsert: true}
  //   );
  // }
  const idpsSchema = new mongoose.Schema(
    {
      provider: {type: String, required: true},
      userId: {type: String, required: true},
      refreshToken: {type: String, required: false},
      accessTokenToken: {type: String, required: false},
    },
    {
      timestamps: true,
      _id: false,
    },
  );

  const card = new mongoose.Schema({
    Last4: {type: String, required: true, default: ''},
    cardCode: {type: String, enum: Object.keys(cardCode), required: true},
    country: {type: String, enum: Object.keys(ISOCountryCodes), required: true},
    first6: {type: String, required: true, default: ''},
    expiryMonth: {type: String, required: true, default: '00'},
    expiryYear: {type: String, required: true, default: '0000'},
  })

  const originalTransaction = new mongoose.Schema({
    completeCode: {type: String, required: true, default: ''},
    tranRef: {type: String, required: true, default: ''},
    card: {type: card, required: true}
  })

  const UserSchema = new mongoose.Schema({
    emiratesId: {type: String, required: false, default: ''},
    phone: {type: String, required: false}, // if signs up with gmail
    email: {type: String, required: false}, // if signs up with phone
    password: {type: String, required: false}, // if signs up with IDP or saving user before OTP
    firstName: {type: String, required: false}, // before OTP
    lastName: {type: String, required: false}, // before OTP
    profilePic: {type: UrlSchema, required: false},
    emiratesIdPic: {type: UrlSchema, required: false}, // store bucket name in constants
    healthCardPic: {type: UrlSchema, required: false}, // store bucket name in constants
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.Patient,
      validate: {
        validator: (v: string) => Object.values(UserRole).some(role => v === role),
        message: (props) => `${(props as Error.ValidatorError).value} is not a valid role.`,
      },
    },
    // TODO identify current address
    addresses: {type: [AddressSchema], default: []},
    active: {type: Boolean, default: false},
    deleted: {type: Boolean, default: false},
    phoneVerified: {type: Boolean, default: false},
    emailVerified: {type: Boolean, default: false},
    idps: {type: [idpsSchema], required: false},
    relations: {type: [FamilySchema], required: false},
    gender: {type: String, enum: ['MALE', 'FEMALE', 'OTHER'], required: false},
    favorites: {type: [String], required: false, default: []},
    originalTransactions: {type: [originalTransaction], required: false}
  }, {
    timestamps: true,
  });

  UserSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    return user;
  };

  UserSchema.index({'addresses.location': '2dsphere'})

  // UserSchema.createIndex({ emiratesId: 1 }, { unique: true });
  // UserSchema.pre('save', async function (next) {
  //   /**
  //    * // todo: this logic should in pre-validate callback because
  //    * mongoose first call validate callback and then save.
  //    */
  //   const user = this as UserModel;
  //   if (user._id && !user.password) {
  //     const existingUser = await this.findOne({_id: this._id}).select('password');
  //     if (existingUser) {
  //       user.password = existingUser.password;
  //     }
  //   } else if (!user._id) {
  //     // const {nextSeqNumber} = await updateSequenceId(Collection.User);
  //     // user.userId = `${nextSeqNumber}`;
  //     next();
  //   }
  //   next();
  // });


  return UserSchema;
};