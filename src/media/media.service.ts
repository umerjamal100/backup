import {HttpStatus, Injectable, NotFoundException} from '@nestjs/common';
import {AwsHelper} from '../helpers/aws.helper';
import {Buckets, FileResponseInterface} from '../helpers/interfaces/aws.helper.interface';
import {systemName} from '../common/constants.common';
import {CSVFileDTO, CSVFilesDto} from './types/dto/media.dto';
import * as csv from 'csvtojson';
import {InjectModel} from '@nestjs/mongoose';
import {Model, Types} from 'mongoose';
import {ProductModelInterface, ProductModelStructure} from '../schemas/product.schema';
import {ProductHelper} from '../helpers/product.helper';
import {PharmacyModelInterface} from '../schemas/pharmacy.schema';
import {HttpErrors} from '../common/errors';
import {PharmacyService} from '../pharmacy/pharmacy.service';
import {User} from '../schemas/interfaces/user.interface';
import {DocumentService} from '../document/document.service';
import {StringUtils} from '../helpers/utils/string.utils';

const ObjectId = Types.ObjectId;

@Injectable()
export class MediaService {
  constructor(
    private readonly awsHelper: AwsHelper,
    private readonly stringUtils: StringUtils,
    private readonly productHelper: ProductHelper,
    @InjectModel('Product')
    private readonly productModel: Model<ProductModelStructure>,
    private readonly pharmacyService: PharmacyService,
    private readonly documentService: DocumentService,
  ) {
  }

  async uploadFiles(files, bucket: string): Promise<FileResponseInterface> {
    const media = await this.awsHelper.uploadMultiple(files, systemName, Buckets[bucket]);
    return {media};
  }

  async getIdCard(filename: string): Promise<string> {
    return this.awsHelper.getSignedUrl(filename, Buckets.IDCARD);
  }

  async uploadCSVToMongo(files: CSVFilesDto, pharmacyId: string): Promise<any> {
    const file: CSVFileDTO = files[0];
    try {
      const pharmacy: PharmacyModelInterface = await this.pharmacyService.getPharmacyById(pharmacyId);
      if (!pharmacy) {
        throw new NotFoundException({
          message: 'please register pharmacy first',
          statusCode: HttpStatus.NOT_FOUND,
          error: HttpErrors.NOT_FOUND,
        });
      }
      const str = file.buffer.toString('utf8');
      const parsed = await csv().fromString(str);
      // TODO check needed col in csv by parsing only first line and comparing it with `MedicineModelStructure` interfaces
      const filteredCols: ProductModelInterface[] = parsed.map(json => ({
        drugCode: json.drugCode,
        insurancePlan: json.insurancePlan,
        packageName: json.packageName,
        salts: json.salts.split(',').map(salt => salt.toString().toLowerCase()),
        strength_raw: json.strength_raw,
        dosageForm: json.dosageForm,
        dispenseModes: json.dispenseModes,
        unitPrice: json.unitPrice,
        packagePrice: json.packagePrice,
        manufacturer: json.manufacturer,
        packageSize: json.packageSize,
        symptoms: json.symptoms.split(','),
        pharmacy: pharmacy.name,
        pharmacyId: pharmacyId,
        internalId: this.stringUtils.uuidv4(),
        category: json.category,
        productType: json.productType
      }));

      // assign internal IDs to medicines here
      // const allProds: Array<{ doc: ProductModelInterface }> = await this.productModel.aggregate()
      //   .group({
      //     _id: '$drugCode',
      //     doc: { $first: '$$ROOT' },
      //   })
      //   .replaceRoot({
      //     doc: '$doc',
      //   });
      //
      // // TODO add reconciliation function
      // const reconciledProd: ProductModelInterface[] = filteredCols.map((prod: ProductModelInterface) => {
      //   const drugCode: string = prod.drugCode
      //   const matchedSaltProd = allProds.find((prod: { doc: ProductModelInterface }) => prod.doc.drugCode === drugCode);
      //   if (matchedSaltProd)
      //     prod.internalId = matchedSaltProd.doc.internalId;
      //   return prod;
      // });

      const products = await this.productModel.create(filteredCols);
      return {status: 'OK'};
    } catch (e) {
      console.warn(e);
    }
  }

  async getDocuments(user: User): Promise<any> {
    try {
      return this.documentService.getPreSignedDocs(user._id);
    } catch (e) {
      console.error(e);
    }
  }
}
