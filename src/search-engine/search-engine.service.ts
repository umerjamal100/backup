import {Injectable, OnModuleInit} from '@nestjs/common';
import {ElasticSearchHelper} from './helpers/elasticSearch.helper';
import {ProductIndex, ProductsIndexInterface} from './interfaces/products.index.interface';
import {GetItemsDTO} from '../product/types/dto/product.dto';
import {Autocomplete} from './interfaces/autocomplete-search';
import {AutocompleteRes} from './interfaces/responses/search.response';

@Injectable()
export class SearchEngineService implements OnModuleInit {
  constructor(
    private readonly searchEngineHelper: ElasticSearchHelper,
  ) {
  }

  async syncProducts(data: ProductsIndexInterface): Promise<boolean | any> {
    // transformed with search index
    // const transformed = this.searchEngineHelper.transformProductData([data], ProductIndex.PRODUCT_SUGGEST);
    const added = await this.searchEngineHelper.indexProduct(ProductIndex.PRODUCT_SUGGEST, data);

    // transformed with suggest index
    // const transformed2 = this.searchEngineHelper.transformProductData([data], ProductIndex.PRODUCT_SEARCH);
    const added2 = await this.searchEngineHelper.indexProduct(ProductIndex.PRODUCT_SEARCH, data);
    return !(added.body.errors && added2.body.errors);
  }

  async autocomplete(query: GetItemsDTO): Promise<AutocompleteRes> {
    const searchResult: Autocomplete = await this.searchEngineHelper.autocomplete(query);
    return this.searchEngineHelper.transformSearchedResults(searchResult);
  }

  async keywordSearch(query: GetItemsDTO): Promise<any> {
    const results = await this.searchEngineHelper.search(query);
    return this.searchEngineHelper.transformFuzzyResults(results);
  }

  async onModuleInit() {
    const suggestIndex = await this.searchEngineHelper.indexExists(ProductIndex.PRODUCT_SUGGEST);
    if (!suggestIndex)
      await this.searchEngineHelper.createSuggestionIndex();
    const productSearch = await this.searchEngineHelper.indexExists(ProductIndex.PRODUCT_SEARCH);
    if (!productSearch)
      await this.searchEngineHelper.createSearchIndex();

    // dummy product
    // const prod: ProductsIndexInterface = {
    //   packageName: 'pain killerssssss',
    //   salts: ['NACL', 'KCL', 'HCL'],
    //   symptoms: ['pain', 'sight'],
    //   manufacturer: 'al kahir Pharmacy',
    //   pharmacy: 'abu bakar store',
    //   pharmacyId: '5f43793d2d1aef599615adc1-87654',
    //   productId: '5f43796f2d1aef599615adc2-0987654',
    // }
    //
    // const transformed = this.searchEngineHelper.transformProductData([prod], ProductIndex.PRODUCT_SEARCH)
    // const added = await this.searchEngineHelper.indexProduct(ProductIndex.PRODUCT_SUGGEST, transformed)
    // const added2 = await this.searchEngineHelper.indexProduct(ProductIndex.PRODUCT_SEARCH, transformed)
    // console.log(added);
  }
}

