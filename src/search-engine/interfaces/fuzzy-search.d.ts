export interface FuzzySearchInterface {
  took: number;
  timed_out: boolean;
  _shards: Shards;
  hits: Hits;
}

interface Hits {
  total: Total;
  max_score: number;
  hits: Hit[];
}

export interface Hit {
  _index: string;
  _type: string;
  _id: string;
  _score: number;
  _source: Source;
}

interface Source {
  pharmacyId: string;
  productId: string;
  internalId: string;
  category: string;
}

interface Total {
  value: number;
  relation: string;
}

interface Shards {
  total: number;
  successful: number;
  skipped: number;
  failed: number;
}