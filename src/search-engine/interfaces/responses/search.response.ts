export type AutocompleteRes = {
  medicine_suggestions: Suggestion[];
  product_suggestions: Suggestion[];
  salts_suggestions: Suggestion[];
  pharmacy_suggestions: Suggestion[];
  symptoms_suggestions: Suggestion[];
}

export type Suggestion = {
  suggest: string;
  score: number;
  type: string;
}