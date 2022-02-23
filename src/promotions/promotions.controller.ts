import {Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards} from '@nestjs/common';
import {PromotionsService} from './promotions.service';
import {CreateAdvertisementDto, UpdateAdvertisementDTO} from './dto/create-promotion.dto';
import {ApiUseTags} from "@nestjs/swagger";
import {AdvertisementModelInterface} from "../schemas/promotion.schema";
import {RolesGuard} from "../auth/guards/roles.guard";
import {Roles} from "../auth/decorators/roles.decorator";
import {UserRole} from "../common/enum.common";
import {PaginationDTO} from "../admin/types/admin.dto";
import {PaginationResponse} from "../common/responses.common";
import {
  PatchRequestAdvertisementDto,
  RequestAdvertisementDto,
  RequestPromotionStatusDto
} from "./dto/request-promotion.dto";
import {RequestAdvertisementModelInterface} from "../schemas/requestPromotion.schema";

@ApiUseTags('Promotions')
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {
  }

  @Roles(UserRole.Pharmacy)
  @UseGuards(RolesGuard)
  @Post('createAdvertisement')
  async createAdvertisement(@Body() createAdvertisementDto: CreateAdvertisementDto, @Req() {user}): Promise<AdvertisementModelInterface> {
    return this.promotionsService.createAdvertisement(createAdvertisementDto, user);
  }

  @Roles(UserRole.Pharmacy)
  @UseGuards(RolesGuard)
  @Get('advertisements')
  async getAdvertisements(@Query() query: PaginationDTO, @Req() {user}): Promise<PaginationResponse> {
    return this.promotionsService.getAdvertisements(query, user);
  }

  @Roles(UserRole.Pharmacy)
  @UseGuards(RolesGuard)
  @Get('requestAdvertisements')
  async getRequestAdvertisements(@Query() query: RequestPromotionStatusDto, @Req() {user}): Promise<PaginationResponse> {
    return this.promotionsService.getRequestAdvertisements(query, user,"advertisement");
  }

  @Get('admin/requestAdvertisements')
  async getAdminRequestAdvertisements(@Query() query: RequestPromotionStatusDto, @Req() {user}): Promise<PaginationResponse> {
    return this.promotionsService.getAdminRequestAdvertisements(query, user,[{
      path: "user",
      model: 'Pharmacy'
    }, {
      path: "advertisement",
      model: 'Promotion'
    }]);
  }

  @Roles(UserRole.Pharmacy)
  @UseGuards(RolesGuard)
  @Patch('advertisements')
  async updateAdvertisement(@Body() body: UpdateAdvertisementDTO, @Req() {user}): Promise<AdvertisementModelInterface> {
    return this.promotionsService.updateAdvertisement(body, user);
  }

  @Roles(UserRole.Pharmacy)
  @UseGuards(RolesGuard)
  @Delete('advertisements/:id')
  async deleteAdvertisement(@Param('id') id: string, @Req() {user}): Promise<AdvertisementModelInterface> {
    return this.promotionsService.deleteAdvertisement(id, user);
  }

  @Roles(UserRole.Pharmacy)
  @UseGuards(RolesGuard)
  @Post('advertisements/request')
  async requestAdvertisement(@Body() body: RequestAdvertisementDto, @Req() {user}): Promise<RequestAdvertisementModelInterface> {
    return this.promotionsService.requestAdvertisement(body,user)
  }

  @Roles(UserRole.Admin)
  @UseGuards(RolesGuard)
  @Patch('advertisements/request')
  async patchAdvertisementRequest(@Body() body: PatchRequestAdvertisementDto, @Req() {user}): Promise<RequestAdvertisementModelInterface> {
    return this.promotionsService.patchAdvertisementRequest(body,user)
  }

}
