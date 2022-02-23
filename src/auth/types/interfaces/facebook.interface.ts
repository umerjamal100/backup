export interface FacebookAuthResponseInterface {
  provider: string;
  id: string;
  displayName: string;
  name: Name;
  gender: string;
  emails: string[];
  photos: Photo[];
  _raw: string;
  _json: Json;
}

interface Json {
  id: string;
  name: string;
  last_name: string;
  first_name: string;
  email: string;
  accessToken: string;
  refreshToken: string;
}

interface Photo {
  value: string;
}

interface Name {
  familyName: string;
  givenName: string;
  middleName: string;
}

export interface FBMeInterface {
  id: string;
  name: string;
  email: string;
  gender: string;
  first_name: string;
  last_name: string;

  // not returned from google, but need in profile creation so adding temp properties
  refreshToken?: string;
  accessToken?: string;

}