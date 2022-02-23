export interface GoogleInterface {
  id: string;
  displayName: string;
  name: Name;
  emails: Array<{value: string; verified: boolean}>
  photos: Photo[];
  provider: string;
  _raw: string;
  _json: GoogleJsonResponse;
}

export interface GoogleJsonResponse {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  email: string;
  verified: boolean;
  picture: string;
  locale: string;
  // not returned from google, but need in profile creation so adding temp properties
  refreshToken?: string;
  accessToken?: string;
}

interface Photo {
  value: string;
}

interface Name {
  familyName: string;
  givenName: string;
}