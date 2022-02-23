import {Inject, Injectable} from '@nestjs/common';
import {ElasticsearchService} from '@nestjs/elasticsearch';
import {ProductIndex, ProductsIndexInterface} from '../interfaces/products.index.interface';
import {GetItemsDTO} from '../../product/types/dto/product.dto';
import {ProductsCategory} from '../../product/types/constants/products.constants';
import {AxiosInstance} from 'axios';
import {Autocomplete, Option} from '../interfaces/autocomplete-search';
import {FuzzySearchInterface} from '../interfaces/fuzzy-search';
import {AutocompleteRes} from "../interfaces/responses/search.response";
import {ProductType} from "../../schemas/interfaces/products.interface";

@Injectable()
export class ElasticSearchHelper {
  constructor(
    private readonly esClient: ElasticsearchService,
    @Inject('ElasticRestApi')
    private readonly esRestApi: AxiosInstance,
  ) {
  }

  async createSuggestionIndex() {
    try {
      const suggestionsIndex = await this.esClient.indices.create({
        index: ProductIndex.PRODUCT_SUGGEST,
        include_type_name: false,
        body: {
          'settings': {
            'index.blocks.read_only': false,
            'index.blocks.read_only_allow_delete': true,
            'max_shingle_diff': 50,
            'analysis': {
              'analyzer': {
                'suggestions': {
                  'type': 'custom',
                  'tokenizer': 'standard',
                  'filter': ['suggestions_shingle', 'lowercase'],
                },
              },
              'filter': {
                'suggestions_shingle': {
                  'type': 'shingle',
                  'min_shingle_size': 2,
                  'max_shingle_size': 50,
                },
              },
            },
          },
          mappings: {
            'properties': {
              'packageName': {'type': 'completion', 'search_analyzer': 'suggestions', 'analyzer': 'standard'},
              'salts': {'type': 'completion', 'search_analyzer': 'suggestions', 'analyzer': 'standard'},
              'manufacturer': {'type': 'completion', 'search_analyzer': 'suggestions', 'analyzer': 'standard'},
              'symptoms': {'type': 'completion', 'search_analyzer': 'suggestions', 'analyzer': 'standard'},
              'pharmacy': {'type': 'completion', 'search_analyzer': 'suggestions', 'analyzer': 'standard'},
              'type': {'type': 'text'},
              'pharmacyId': {'type': 'text'},
              'productId': {'type': 'text'},
              'internalId': {'type': 'text'},
              'category': {'type': 'text'},
            },
          },
        },
      });
      console.log(suggestionsIndex);
    } catch (e) {
      console.error(e);
    }
  }

  async createSearchIndex(): Promise<any> {
    try {
      const searchIndex = await this.esClient.indices.create({
        index: ProductIndex.PRODUCT_SEARCH,
        include_type_name: false,
        body: {
          'settings': {
            'index': {
              'blocks.read_only': false,
              'blocks.read_only_allow_delete': true,
              'number_of_shards': 1,
              'analysis': {
                'analyzer': {
                  'trigram': {
                    'type': 'custom',
                    'tokenizer': 'standard',
                    'filter': ['lowercase', 'shingle'],
                  },
                  'reverse': {
                    'type': 'custom',
                    'tokenizer': 'standard',
                    'filter': ['lowercase', 'reverse'],
                  },
                },
                'filter': {
                  'shingle': {
                    'type': 'shingle',
                    'min_shingle_size': 2,
                    'max_shingle_size': 3,
                  },
                },
              },
            },
          },
          mappings: {
            'properties': {
              'packageName': {
                'type': 'text',
                'fields': {
                  'trigram': {
                    'type': 'text',
                    'analyzer': 'trigram',
                  },
                  'reverse': {
                    'type': 'text',
                    'analyzer': 'reverse',
                  },
                },
              },
              'symptom': {
                'type': 'text',
                'fields': {
                  'trigram': {
                    'type': 'text',
                    'analyzer': 'trigram',
                  },
                  'reverse': {
                    'type': 'text',
                    'analyzer': 'reverse',
                  },
                },
              },
              'salts': {
                'type': 'text',
                'fields': {
                  'trigram': {
                    'type': 'text',
                    'analyzer': 'trigram',
                  },
                  'reverse': {
                    'type': 'text',
                    'analyzer': 'reverse',
                  },
                },
              },
              'manufacturer': {
                'type': 'text',
                'fields': {
                  'trigram': {
                    'type': 'text',
                    'analyzer': 'trigram',
                  },
                  'reverse': {
                    'type': 'text',
                    'analyzer': 'reverse',
                  },
                },
              },
              'pharmacy': {
                'type': 'text',
                'fields': {
                  'trigram': {
                    'type': 'text',
                    'analyzer': 'trigram',
                  },
                  'reverse': {
                    'type': 'text',
                    'analyzer': 'reverse',
                  },
                },
              },
              'type': {'type': 'text'},
              'pharmacyId': {'type': 'text'},
              'productId': {'type': 'text'},
              'internalId': {'type': 'text'},
              'category': {'type': 'text'},
            },
          },
        },
      });
      console.log(searchIndex);
    } catch (e) {
      console.error(e);
    }
  }

  async indexExists(indexName: string): Promise<boolean> {
    try {
      const exists = await this.esClient.indices.exists({index: indexName});
      return !!exists.body;
    } catch (e) {
      console.error(e);
    }
  }

  async indexProduct(indexName: string, data: ProductsIndexInterface): Promise<any> {
    try {
      const indexed = await this.esClient.index({
        index: indexName,
        // type: indexName === ProductIndex.PRODUCT_SUGGEST ? 'doc' : '_doc',
        body: data,
      });
      console.log(indexed);
      return indexed;
    } catch (e) {
      console.error(e);
    }
  }

  transformProductData(data: ProductsIndexInterface[], indexName: string) {
    return data.reduce((docs, doc) => {
      docs = docs ? [...docs, {
        index: {
          _index: indexName,
          _id: doc.productId,
        },
      }, {[indexName === ProductIndex.PRODUCT_SEARCH ? '_doc' : 'doc']: doc}] : [{index: {_index: indexName}}, {doc}];
      return docs;
    }, []);
  }

  async autocomplete(query: GetItemsDTO): Promise<any> {
    try {
      // const where = this.prsuggestionsoductHelper.getItemQuery(query);
      const data = await this.esClient.search({
        index: ProductIndex.PRODUCT_SUGGEST,
        body: {
          // size: 100,
          // from: query.cursor || 0,
          '_source': ['_id', 'category', 'type'],
          'suggest': {
            'salts_suggestions': {
              'prefix': query.search,
              'completion': {
                'field': 'salts',
                'skip_duplicates': true,
                'fuzzy': {
                  'fuzziness': 'auto',
                },
              },
            },
            'packageName_suggestions': {
              'prefix': query.search,
              'completion': {
                'field': 'packageName',
                'skip_duplicates': true,
                'fuzzy': {
                  'fuzziness': 'auto',
                },
              },
            },
            'symptoms_suggestions': {
              'prefix': query.search,
              'completion': {
                'field': 'symptoms',
                'skip_duplicates': true,
                'fuzzy': {
                  'fuzziness': 'auto',
                },
              },
            },
            'pharmacy_suggestions': {
              'prefix': query.search,
              'completion': {
                'field': 'pharmacy',
                'skip_duplicates': true,
                'fuzzy': {
                  'fuzziness': 'auto',
                },
              },
            },
          },
        },
      });
      return data;
    } catch (e) {
      console.error(JSON.stringify(e));
    }
  }

  async search(query: GetItemsDTO): Promise<FuzzySearchInterface> {
    try {
      const body = {
        'suggest': {
          'text': query.search,
          'simple_phrase': {
            'phrase': {
              'field': ProductsCategory[query.category],
              'size': 3,
              'real_word_error_likelihood': 0.95,
              'max_errors': 90,
              'direct_generator': [
                {
                  'field': ProductsCategory[query.category],
                  'suggest_mode': 'always',
                  'size': 5,
                },
              ],
              'collate': {
                'query': {
                  'source': {
                    'match': {
                      [ProductsCategory[query.category]]: {
                        'query': '{{suggestion}}',
                        'fuzziness': '2',
                        'operator': 'and',
                      },
                    },
                  },
                  // 'inline': {
                  //   'match_phrase': {
                  //     '{{field_name}}': '{{suggestion}}',
                  //   },
                  // },
                },
                'params': {
                  'field_name': ProductsCategory[query.category],
                },
                // 'prune': false,
              },
            },
          },
        },
        'size': 0,
      };
      // const res = await this.esRestApi.get(`${ProductIndex.PRODUCT_SEARCH}/_search`, {
      //   data: JSON.stringify(body),
      // });
      const res = await this.esClient.search({
        index: ProductIndex.PRODUCT_SEARCH,
        body: {
          '_source': ['productId', 'PharmacyId', 'internalId', 'category'],
          'query': {
            'match': {
              [ProductsCategory[query.category] || ProductsCategory.PACKAGENAME]: {
                'query': query.search,
                'fuzziness': 2,
                'prefix_length': 1,
              },
            },
          },
        },
      });
      return res.body as unknown as FuzzySearchInterface;
    } catch (e) {
      console.error(JSON.stringify(e));
    }
  }

  transformSearchedResults(data: Autocomplete): AutocompleteRes {

    return {
      medicine_suggestions: data.body.suggest.packageName_suggestions[0].options.reduce((prev, curr) => {
        if (curr._source.type === ProductType.MEDICINE)
          prev.push({
            suggest: curr.text,
            score: curr._score,
            type: curr._source.type
          })
        return prev
      }, []),
      product_suggestions: data.body.suggest.packageName_suggestions[0].options.reduce((prev, curr) => {
        if (curr._source.type === ProductType.PRODUCT)
          prev.push({
            suggest: curr.text,
            score: curr._score,
            type: curr._source.type
          })
        return prev
      }, []),
      salts_suggestions: data.body.suggest.salts_suggestions[0].options.map((opt: Option) => ({
        suggest: opt.text,
        score: opt._score,
        type: opt._source.type
      })),
      pharmacy_suggestions: data.body.suggest.pharmacy_suggestions[0].options.map((opt: Option) => ({
        suggest: opt.text,
        score: opt._score,
        type: opt._source.type
      })),
      symptoms_suggestions: data.body.suggest.symptoms_suggestions[0].options.map((opt: Option) => ({
        suggest: opt.text,
        score: opt._score,
        type: opt._source.type
      })),
    };
  }

  transformFuzzyResults(data: FuzzySearchInterface) {
    return data?.hits?.hits;
  }
}
