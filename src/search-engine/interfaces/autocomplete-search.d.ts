export type Shards = {
  total: number;
  successful: number;
  skipped: number;
  failed: number;
};

export type Total = {
  value: number;
  relation: string;
};

export type Hits = {
  total: Total;
  max_score?: any;
  hits: any[];
};

export type Source = {
  category: string;
  type: string
};

export type Option = {
  text: string;
  _index: string;
  _type: string;
  _id: string;
  _score: number;
  _source: Source;
};

export type PackageNameSuggestion = {
  text: string;
  offset: number;
  length: number;
  options: Option[];
};

export type Suggestions = {
  text: string;
  offset: number;
  length: number;
  options: any[];
}
export type PharmacySuggestion = Suggestions;

export type Option2 = {
  text: string;
  _index: string;
  _type: string;
  _id: string;
  _score: number;
  _source: any;
};

export type SaltsSuggestion = Suggestions;

export type SymptomsSuggestion = Suggestions;

export type Suggest = {
  packageName_suggestions: PackageNameSuggestion[];
  pharmacy_suggestions: PharmacySuggestion[];
  salts_suggestions: SaltsSuggestion[];
  symptoms_suggestions: SymptomsSuggestion[];
};

export type Body = {
  took: number;
  timed_out: boolean;
  _shards: Shards;
  hits: Hits;
  suggest: Suggest;
};

export type Headers = {
  'content-type': string;
  'content-length': string;
};

export type Headers2 = {
  'user-agent': string;
  'content-type': string;
  'content-length': string;
};

export type Params = {
  method: string;
  path: string;
  body: string;
  querystring: string;
  headers: Headers2;
  timeout: number;
};

export type Options = {
  warnings?: any;
};

export type Request = {
  params: Params;
  options: Options;
  id: number;
};

export type Headers3 = {};

export type Roles = {
  master: boolean;
  data: boolean;
  ingest: boolean;
  ml: boolean;
};

export type Connection = {
  url: string;
  id: string;
  headers: Headers3;
  deadCount: number;
  resurrectTimeout: number;
  _openRequests: number;
  status: string;
  roles: Roles;
};

export type Meta = {
  context?: any;
  request: Request;
  name: string;
  connection: Connection;
  attempts: number;
  aborted: boolean;
};

export type Autocomplete = {
  body: Body;
  statusCode: number;
  headers: Headers;
  warnings?: any;
  meta: Meta;
};


