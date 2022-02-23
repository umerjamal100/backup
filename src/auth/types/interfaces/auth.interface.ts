export interface WebLoginBody {
  email: string;
  password: string;
}

export interface PatientLoginBody {
  emiratesId: string;
  code: string;
}

export interface GuestLoginBody {
  phone: string;
  code: string;
}

export interface VerifyEmail {
  email: string;
  code: string;
}

export interface PhoneEmailInterface {
  email?: string;
  phone?: string;
}

export enum IDP {
  FACEBOOK = 'FACEBOOK',
  GOOGLE = 'GOOGLE',
  APPLE = 'APPLE'
}

export const enum GooglePlatform {
  WEB = 'WEB',
  IOS = 'IOS',
  ANDROID = 'ANDROID',
}