import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {DocumentsModelStructure} from '../schemas/document.schema';
import {Model} from 'mongoose';
import {UserDocs} from './types/interfaces/document';
import {DocumentsHelper} from '../helpers/documents.helper';
import {Nullable} from '../schemas/interfaces/relationship.interface';
import {FamilyModelInterface} from '../schemas/family.schema';
import {PrescriptionModelStructure} from '../schemas/prescription.schema';

@Injectable()
export class DocumentService {
  constructor(
    @InjectModel('Document')
    private readonly docModel: Model<DocumentsModelStructure>,
    private readonly documentsHelper: DocumentsHelper,
  ) {
  }

  async upsert(where: any, data: any, options?: any) {
    try {
      return await this.docModel.updateOne(where, data, {lean: true, upsert: true, session: options.sessions});
    } catch (e) {
      console.error(e);
    }
  }

  async updateOnPatchProfile(docs: Nullable<UserDocs>, options?: any): Promise<any> {
    const documents = this.documentsHelper.getDocsOnly(docs);
    const {relations, ...userDocs} = documents;
    try {
      const updated = await this.upsert({user: docs._id}, {
        $set: {...userDocs}, $push: {
          relations: relations ?? [],
        },
      });
    } catch (e) {
      console.error(e);
    }
  }

  async updateOnPatchRelation(relation: FamilyModelInterface, userId: string, options?: any): Promise<any> {
    try {
      const documents = this.documentsHelper.getDocsOnly({relations: [relation]});
      const {relations, ...userDocs} = documents;
      const updated = await this.docModel.findOneAndUpdate({
        user: userId,
        'relations._id': relation._id,
      }, {'relations.$': relations[0]}, {session: options.session});
      return updated;
    } catch (e) {
      console.error(e);
    }
  }

  // documents in aws private buckets;
  async getPreSignedDocs(userId: string): Promise<any> {
    try {
      const docs: UserDocs = await this.docModel.findOne({user: userId}).lean();
      return this.documentsHelper.getSignedDocs(docs);
    } catch (e) {
      console.error(e);
    }
  }

  async updateOnPrescription(prescriptions: PrescriptionModelStructure[], userId: string): Promise<any> {
    try {
      const updated = await this.upsert(
        {user: userId},
        {
          $push: {prescriptions},
        }, {});
    } catch (e) {
      console.error(e);
    }
  }
}
