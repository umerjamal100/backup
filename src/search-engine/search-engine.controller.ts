import {Controller} from '@nestjs/common';
import {SearchEngineService} from './search-engine.service';
import {MessagePattern} from '@nestjs/microservices';
import {MESSAGE_PATTERNS} from '../common/constants.common';
import {GetItemsDTO} from '../product/types/dto/product.dto';
import {AutocompleteRes} from './interfaces/responses/search.response';

// TODO use pipes for data validation (DTO)
@Controller('search-engine')
export class SearchEngineController {
  constructor(
    private readonly searchEngineService: SearchEngineService,
  ) {
  }

  @MessagePattern(MESSAGE_PATTERNS.SYNC_PRODUCTS)
  async sync(data: any): Promise<any> {
    return this.searchEngineService.syncProducts(data);
  }

  @MessagePattern(MESSAGE_PATTERNS.AUTO_COMPLTEE_SUGGESTIONS)
  async autocomplete(data: GetItemsDTO): Promise<AutocompleteRes> {
    return this.searchEngineService.autocomplete(data);
  }

  @MessagePattern(MESSAGE_PATTERNS.KEYWORD_SEARCH)
  async keywordSearch(data: GetItemsDTO): Promise<any> {
    return this.searchEngineService.keywordSearch(data);
  }
}
