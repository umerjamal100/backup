import {UserDocs} from '../document/types/interfaces/document';
import {Nullable} from '../schemas/interfaces/relationship.interface';
import {AwsHelper} from './aws.helper';
import {DocFieldToBucket} from '../document/types/constants/document.constants';
import {Injectable} from '@nestjs/common';

@Injectable()
export class DocumentsHelper {
  constructor(
    private readonly awsHelper: AwsHelper,
  ) {
  }

  getDocsOnly(data: Nullable<UserDocs>) {
    const relationDocs = data.relations?.filter(Boolean)?.map(relation => {
      const keys = Object.keys(relation);
      const doc = keys.reduce((docs, k) => {
        if (k.toLowerCase().includes('Pic'.toLowerCase())) {
          docs = {...docs, [k]: relation[k]};
        }
        return docs;
      }, {});
      return {...doc, emiratesId: relation.emiratesId};
    });
    const userDocs = Object.keys(data).reduce((docs, k) => {
      if (k.toLowerCase().includes('Pic'.toLowerCase())) {
        docs = {...docs, [k]: data[k]};
      }
      return docs;
    }, {});
    return {
      ...userDocs,
      relations: relationDocs,
    };
  }

  async getSignedDocs(data: Nullable<UserDocs>): Promise<any> {
    try {
      const relations = [];
      if (data?.relations) {
        for (const rel of data?.relations) {
          let preSignedDocs = {};
          for (const k of Object.keys(rel)) {
            if (rel[k] && k.toLowerCase().includes('Pic'.toLowerCase())) {
              const preSignedUrl = await this.awsHelper.getSignedUrl(rel[k], DocFieldToBucket[k]);
              preSignedDocs = {...preSignedDocs, [k]: preSignedUrl};
            }
          }
          relations.push({...preSignedDocs, emiratesId: rel.emiratesId});
        }
      }
      const userDocs = {};
      for (const k of Object.keys(data)) {
        if (k !== 'relations' && k.toLowerCase().includes('Pic'.toLowerCase())) {
          if (Array.isArray(data[k])) {
            for (const val of data[k]) {
              const preSigneUrl = await this.awsHelper.getSignedUrl(val, DocFieldToBucket[k]);
              userDocs[k] = preSigneUrl;
            }
          } else {
            const preSigneUrl = await this.awsHelper.getSignedUrl(data[k], DocFieldToBucket[k]);
            userDocs[k] = preSigneUrl;
          }
        }
      }
      const prescriptions = [];
      if (data?.prescriptions) {
        for (const prescription of data?.prescriptions) {
          const {urlBucket} = prescription
          prescription.urlBucket = [];
          for (const uri of urlBucket) {
            const signedUrl = await this.awsHelper.getSignedUrl(uri.url, DocFieldToBucket['prescriptions']);
            prescription.urlBucket.push({bucketName: uri.bucketName, url: signedUrl})
            prescriptions.push(prescription);
          }
        }
      }
      return {
        ...userDocs,
        relations,
        prescriptions,
      };
    } catch (e) {
      console.error(e);
    }
  }
}