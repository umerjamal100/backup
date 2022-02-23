import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {
  PrescriptionModelInterface,
  PrescriptionModelStructure,
  UrlSchemaModelInterface
} from '../schemas/prescription.schema';
import {DocumentService} from '../document/document.service';
import * as _ from 'lodash';
import {Buckets} from "../helpers/interfaces/aws.helper.interface";
import {User} from "../schemas/interfaces/user.interface";
import {FamilyModelInterface} from "../schemas/family.schema";

@Injectable()
export class PrescriptionService {
  constructor(
    @InjectModel('Prescription')
    private readonly prescriptionModel: Model<PrescriptionModelStructure>,
    private readonly documentService: DocumentService,
  ) {
  }

  async create(data: PrescriptionModelInterface): Promise<PrescriptionModelInterface> {
    try {
      // update bucket name
      const {urlBucket} = data
      const user = data.user as User
      if (data.relation) {
        const relation = user.relations.find(relation => relation._id.toString() === data.relation) as FamilyModelInterface
        if (_.isEmpty(relation))
          throw new NotFoundException('Relation not exist')
        const bucketsEnum = Object.keys(Buckets)
        for (const _enum of bucketsEnum) {
          if (_enum === relation.emiratesIdPic.bucketName) {
            relation.emiratesIdPic.bucketName = Buckets[_enum] as Buckets
          }
          if (_enum === relation.healthCardPic.bucketName) {
            relation.healthCardPic.bucketName = Buckets[_enum] as Buckets
          }
          if (_enum === relation.profilePic.bucketName) {
            relation.profilePic.bucketName = Buckets[_enum] as Buckets
          }
        }
        data.relation = relation
      }
      data.user = user._id.toString()
      await this.updatePrescriptionOriginalBucketName(urlBucket)
      const created: PrescriptionModelInterface = (await new this.prescriptionModel(data).save()).toObject();
      //this.documentService.updateOnPrescription(created, created.user);
      created.urlBucket = await this.updatePrescriptionEnumBucketName(created.urlBucket)
      return created;
    } catch (e) {
      console.error(e);
    }
  }

  async getPrescription(prescriptionId: string): Promise<PrescriptionModelInterface> {
    try {
      const prescription = await this.prescriptionModel.findOne({_id: prescriptionId}).lean();
      if (_.isEmpty(prescription))
        throw new NotFoundException('No Prescription Found')
      return prescription
    } catch (e) {
      console.log(e)
    }

  }

  async updatePrescriptionOriginalBucketName(urlBucket: UrlSchemaModelInterface[]) {
    for (const _urlBucket of urlBucket) {
      _urlBucket.bucketName = Buckets[_urlBucket.bucketName]
    }
  }

  async updatePrescriptionEnumBucketName(urlBucket: UrlSchemaModelInterface[]): Promise<UrlSchemaModelInterface[]> {
    const updatedBucketName = []
    for (const _urlBucket of urlBucket) {
      const bucketsEnum = Object.keys(Buckets)
      for (const _enum of bucketsEnum) {
        const enu = Buckets[_enum]
        if (enu === _urlBucket.bucketName) {
          _urlBucket.bucketName = _enum as Buckets
          updatedBucketName.push(_urlBucket)
        }
      }
    }
    return updatedBucketName
  }

}
