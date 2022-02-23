import {Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards} from '@nestjs/common';
import {PharmacyService} from './pharmacy.service';
import {PharmacyModelInterface, PharmacyModelStructure} from '../schemas/pharmacy.schema';
import {
  AdminPharmacyOrderChatDTO,
  BucketIdDTO,
  BucketVideoDTO,
  CreatePharmacyDTO,
  NearByDTO,
  PharmacyDTOs,
  PharmacyIdDTO,
  PharmacyOnlineDTO,
  PharmacyOrderAcceptanceDTO,
  StatsQueryDTO
} from './types/dto/pharmacy.dto';
import {ApiUseTags} from '@nestjs/swagger';
import {BucketModelInterface} from "../schemas/bucket.schema";
import {Roles} from "../auth/decorators/roles.decorator";
import {UserRole} from "../common/enum.common";
import {AuthenticatedGuard} from "../auth/guards/Authenticated.guard";
import {AdminChatPaginationDTO, AdminMessage, UserClickedDto,} from "../users/types/dto/user.dto";
import {PharmacyOrderChatModelInterface} from "../schemas/adminChatSchema";
import {AdminChatMessageSchemaInterface} from "../schemas/adminChatMessage.schema";
import {PaginationResponse} from "../common/responses.common";

@ApiUseTags('Pharmacy')
@Controller('pharmacy')
export class PharmacyController {
  constructor(
    private readonly PharmacyService: PharmacyService,
  ) {
  }

  // TODO use admin permission, and Add DTO
  // @UseGuards(AuthGuard('admin'))
  @Post()
  async registerPharmacy(@Body() body: CreatePharmacyDTO, @Req() req): Promise<PharmacyModelStructure> {
    console.log(body);
    return this.PharmacyService.save(body)
  }

  @Get('todayStats')
  async pharmacyTodayStats(@Query() query: StatsQueryDTO, @Req() req): Promise<any> {
    return await this.PharmacyService.getPharmacyTodayStats(req.user, req.query);
  }

  @Roles(UserRole.Pharmacy)
  @UseGuards(AuthenticatedGuard)
  @Get('getConfiguration')
  async getConfiguration(@Req() {user}): Promise<any> {
    return this.PharmacyService.getConfiguration(user)
  }

  @Get('buckets')
  async pharmacyAllOrders(@Req() req): Promise<BucketModelInterface[]> {
    return await this.PharmacyService.getPharmacyBuckets(req.user);
  }

  @Get(':pharmacyId')
  async getPharmacyById(@Param() params: PharmacyIdDTO, @Query() query: PharmacyDTOs): Promise<PharmacyModelInterface> {
    return this.PharmacyService.getPharmacy(params.pharmacyId, query.userId);
  }

  @Get('search/nearBy')
  async getNearBy(@Query() query: NearByDTO): Promise<any> {
    return this.PharmacyService.getNearByPharmacies(query.coordinates, +query.radius);
  }

  @Post('order/acceptance')
  async pharmacyOrderAcceptance(@Body() body: PharmacyOrderAcceptanceDTO, @Req() req): Promise<BucketModelInterface> {
    return this.PharmacyService.pharmacyOrderAcceptance(body, req.user)
  }

  @Get('bucket/:bucketId')
  async getPharmacyBucket(@Param() params: BucketIdDTO, @Req() req): Promise<any> {
    return await this.PharmacyService.getPharmacyBucket(params.bucketId, req.user);
  }

  @Post('bucket/video')
  async addVideoToBucket(@Body() body: BucketVideoDTO, @Req() req): Promise<BucketModelInterface> {
    return this.PharmacyService.addVideoToBucket(body, req.user)
  }

  @Roles(UserRole.Pharmacy)
  @UseGuards(AuthenticatedGuard)
  @Post('pharmacyOpenOrderChat')
  async openPharmacyAdminOrderChat(@Body() pharmacyOrderChat: AdminPharmacyOrderChatDTO, @Req() {user}): Promise<PharmacyOrderChatModelInterface> {
    return this.PharmacyService.openPharmacyAdminOrderChat(pharmacyOrderChat, user)
  }

  @Roles(UserRole.Pharmacy)
  @UseGuards(AuthenticatedGuard)
  @Post('openInformationChat')
  async openAdminInformationChat(@Req() {user}, @Body() body: UserClickedDto): Promise<any> {
    return this.PharmacyService.openAdminInformationChat(user, body)
  }

  @Roles(UserRole.Pharmacy)
  @UseGuards(AuthenticatedGuard)
  @Post('saveMessageAdmin')
  async sendMessageAdmin(@Body() message: AdminMessage, @Req() {user}): Promise<AdminChatMessageSchemaInterface> {
    return this.PharmacyService.saveMessageAdmin(message, user)
  }

  @Roles(UserRole.Pharmacy)
  @UseGuards(AuthenticatedGuard)
  @Post('saveInformationMessageAdmin')
  async saveInformationMessageAdmin(@Body() message: AdminMessage, @Req() {user}): Promise<any> {
    return this.PharmacyService.saveInformationMessageAdmin(message, user)
  }

  @Roles(UserRole.Pharmacy)
  @UseGuards(AuthenticatedGuard)
  @Get('adminChat/:adminChatId')
  async getAdminChat(@Query() query: AdminChatPaginationDTO): Promise<PaginationResponse> {
    return this.PharmacyService.getAdminChatMessages(query)
  }

  @Patch(':pharmacyId')
  async patchPharmacy(@Param() params: PharmacyIdDTO, @Body() body: PharmacyOnlineDTO): Promise<PharmacyModelInterface> {
    return this.PharmacyService.patchPharmacy(params.pharmacyId, body.isOnline)
  }

}
