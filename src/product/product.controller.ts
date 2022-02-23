import {Body, Controller, Get, Param, Patch, Query, Req, UseGuards} from '@nestjs/common';
import {ProductService} from './product.service';
import {GetItemsDTO, ProductDTO, ProductIdDTO, ProductSuggestionDTO, SearchAndSortDTO} from './types/dto/product.dto';
import {PaginationResponse} from '../common/responses.common';
import {ApiOkResponse, ApiUseTags} from '@nestjs/swagger';
import {ProductModelStructure} from '../schemas/product.schema';
import {PharmacyIdDTO, ProductTypeExtendedDTO} from '../pharmacy/types/dto/pharmacy.dto';
import {Roles} from "../auth/decorators/roles.decorator";
import {UserRole} from "../common/enum.common";
import {RolesGuard} from "../auth/guards/roles.guard";

@ApiUseTags('Product')
@Controller('product')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
  ) {
  }

  @Get('id/:productId')
  async getProductById(@Param() params: ProductIdDTO): Promise<ProductModelStructure> {
    return this.productService.searchById(params.productId);
  }

  @Roles(UserRole.Pharmacy)
  @UseGuards(RolesGuard)
  @Patch('id/:productId')
  async patchProductById(@Param('productId') productId: string, @Body() product: ProductDTO,@Req() {user}): Promise<ProductModelStructure> {
    return this.productService.patchProductById(productId, product,user);
  }

  // TODO add DTO
  @ApiOkResponse({type: PaginationResponse})
  @Get('autocomplete')
  async autocomplete(@Query() query: GetItemsDTO): Promise<PaginationResponse> {
    return this.productService.autocomplete(query);
  }

  @ApiOkResponse({type: PaginationResponse})
  @Get('search')
  async search(@Query() query: SearchAndSortDTO): Promise<PaginationResponse> {
    return this.productService.searchAndSort(query);
  }

  // TODO get prices from nearest Pharmacy
  @ApiOkResponse({type: PaginationResponse})
  @Get('search/fullText')
  async fullTextSearch(@Query() query: GetItemsDTO): Promise<PaginationResponse> {
    return this.productService.fullTextSearch(query.search);
  }

  @Get('symptoms/:productType')
  async getAllSymptoms(@Param() param: ProductTypeExtendedDTO): Promise<any> {
    return this.productService.getSymptoms(param);
  }

  @Get('categories/:pharmacyId')
  async getAllCategories(@Param() params: PharmacyIdDTO): Promise<string[]> {
    return this.productService.getCategories(params.pharmacyId);
  }

  @Get('pharmacy')
  async getProdsByPharmacy(@Query() query: GetItemsDTO): Promise<any> {
    return this.productService.getProdsByPharmacyId(query.pharmacyId, query);
  }

  @Get('suggestion')
  async getProductSuggestion(@Query() body:ProductSuggestionDTO):Promise<any>{
    return await this.productService.getProductSuggestion(body)
  }

  @Get('price/:id')
  async getProductPrice(@Param('id') id:string){
    return this.productService.getProductPrice(id)
  }
}
