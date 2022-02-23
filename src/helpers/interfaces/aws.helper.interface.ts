export interface AvatarInterface {
  background?: string;
  color?: string;
  name: string;
  rounded?: boolean;
  size?: number;
}

export interface FileInterface {
  fieldname: string;
  originalname: string;
  encoding: string;
  buffer: Buffer;
  size: number;
  mimetype: string;
}

export class Avatar implements AvatarInterface {

  readonly background: string;
  readonly color: string;
  readonly name: string;
  readonly rounded: boolean;
  readonly size: number;

  constructor(options: AvatarInterface) {
    this.background = options.background || '000000';
    this.color = options.color || 'ffffff';
    this.name = options.name;
    this.rounded = options.rounded ? options.rounded : true;
    this.size = options.size || 512;
  }
}

export enum FileInterfaceFields {
  avatar = 'avatar',
  encoding = '7bit',
  ext = '.png',
}

export interface UploadFileResponseInterface {
  name: string;
  url: string;
  type: string;
}

export interface FileResponseInterface {
  media: UploadFileResponseInterface[];
}

export enum Buckets {
  IDCARD = 'boon-idcards',
  PRESCRIPTION = 'boon-prescriptions',
  PROFILE = 'deep-dive-test-profiles',
  HEALTH_CARD = 'boon-health-cards',
  AD = 'boon-ads'
}

export const BucketName = ['IDCARD', 'boon-idcards',
  'PRESCRIPTION', 'boon-prescriptions',
  'PROFILE', 'deep-dive-test-profiles',
  'HEALTH_CARD', 'boon-health-cards',
  'AD', 'boon-ads']

