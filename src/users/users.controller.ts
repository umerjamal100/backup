import {Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards} from '@nestjs/common';
import {UsersService} from './users.service';
import {ApiUseTags} from '@nestjs/swagger';
import {
  AddressDto,
  AddressIdDTO,
  AdminChatPaginationDTO,
  AdminMessage,
  AdminOrderChatDTO,
  FamilyDTO,
  FavoritesParams,
  MongoIdDTO,
  PatchFamilyDTO,
  PatchProfileDTO,
  RatingDTO, SaveCardTransactionDTO,
  UserClickedDto,
  UserPaymentAcceptanceDTO,
} from './types/dto/user.dto';
import {AuthenticatedGuard} from '../auth/guards/Authenticated.guard';
import {Roles} from "../auth/decorators/roles.decorator";
import {UserRole} from "../common/enum.common";
import {RolesGuard} from "../auth/guards/roles.guard";
import {ProductModelInterface} from "../schemas/product.schema";
import {PaginationResponse} from "../common/responses.common";
import {UnRatedOrdersResponse} from "../order/types/interfaces/order.interface";

@ApiUseTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {
  }

  @Roles(UserRole.Patient)
  @UseGuards(RolesGuard)
  @Post('saveCardOriginalTransaction')
  async saveCardOriginalTransaction(@Body() body: SaveCardTransactionDTO, @Req() {user, session}): Promise<any> {
    return this.usersService.saveCardOriginalTransaction(body, user._id, session)
  }


  @UseGuards(AuthenticatedGuard)
  @Patch('profile')
  async updateProfile(@Body() body: PatchProfileDTO, @Req() req): Promise<any> {
    const user = await this.usersService.patchProfile(body, req.user._id, req.session);
    return user;
  }

  @UseGuards(AuthenticatedGuard)
  @Patch('address')
  async updateAddress(@Body() body: AddressDto, @Query() query: AddressIdDTO, @Req() req): Promise<any> {
    const user = await this.usersService.patchAddress(body, query, req.user._id);
    return user;
  }


  @UseGuards(AuthenticatedGuard)
  @Delete('address')
  async deleteAddress(@Query() query: AddressIdDTO, @Req() req): Promise<any> {
    const user = await this.usersService.deleteAddress(query, req.user._id);
    return user;
  }

  @UseGuards(AuthenticatedGuard)
  @Get('me')
  async getMe(@Req() req): Promise<any> {
    return this.usersService.getMe(req.user._id);
  }

  @UseGuards(AuthenticatedGuard)
  @Patch('/relations')
  async updateRelations(@Body() body: PatchFamilyDTO, @Req() req): Promise<any> {
    const user = await this.usersService.patchRelations(body, req.user._id, req.session);
    return user;
  }

  @UseGuards(AuthenticatedGuard)
  @Post('/relations')
  async addRelations(@Body() body: FamilyDTO, @Req() req): Promise<any> {
    const user = await this.usersService.addRelations(body, req.user._id, req.session);
    return user;
  }

  @UseGuards(AuthenticatedGuard)
  @Delete('/relation/:id')
  async deleteRelations(@Param() param: MongoIdDTO, @Req() req): Promise<any> {
    const user = await this.usersService.deleteRelations(param.id, req.user._id, req.session);
    return user;
  }

  @Roles(UserRole.Patient)
  @UseGuards(RolesGuard)
  @Post('/address')
  async addAddress(@Body() body: AddressDto, @Req() req): Promise<any> {
    const user = await this.usersService.addAddress(body, req.user._id);
    return user;
  }

  @Roles(UserRole.Patient)
  @UseGuards(RolesGuard)
  @Post('/rating')
  async userRating(@Body() body: RatingDTO, @Req() req): Promise<any> {
    return this.usersService.userRating(body, req.user._id);
  }

  @UseGuards(AuthenticatedGuard)
  @Post('/payment/acceptance')
  async PaymentAcceptance(@Body() body: UserPaymentAcceptanceDTO, @Req() req): Promise<any> {
    return await this.usersService.paymentAcceptance(body, req.user);
  }

  @Roles(UserRole.Patient)
  @UseGuards(AuthenticatedGuard)
  @Get('favorites')
  async getFavouriteMedicines(@Req() {user}): Promise<ProductModelInterface> {
    return this.usersService.getFavoriteMedicines(user['_id'].toString())
  }

  @Roles(UserRole.Patient)
  @UseGuards(AuthenticatedGuard)
  @Post('favorites')
  async addFavouriteMedicine(@Query() query: FavoritesParams, @Req() {user}) {
    await this.usersService.addFavoriteMedicine(query, user)
  }

  @Roles(UserRole.Patient)
  @UseGuards(AuthenticatedGuard)
  @Delete('favorites')
  async removeFavouriteMedicine(@Query() query: FavoritesParams, @Req() {user}): Promise<any> {
    await this.usersService.removeFavouriteMedicine(query, user)
  }

  @Roles(UserRole.Patient)
  @UseGuards(AuthenticatedGuard)
  @Post('openOrderChat')
  async openAdminOrderChat(@Body() orderChat: AdminOrderChatDTO, @Req() {user}): Promise<any> {
    return this.usersService.openAdminOrderChat(orderChat, user)
  }

  @Roles(UserRole.Patient)
  @UseGuards(AuthenticatedGuard)
  @Post('openInformationChat')
  async openAdminInformationChat(@Req() {user}, @Body() body: UserClickedDto): Promise<any> {
    return this.usersService.openAdminInformationChat(user, body)
  }

  @Roles(UserRole.Patient)
  @UseGuards(AuthenticatedGuard)
  @Post('saveOrderMessageAdmin')
  async sendMessageAdmin(@Body() message: AdminMessage, @Req() {user}): Promise<any> {
    return this.usersService.saveOrderMessageAdmin(message, user)
  }

  @Roles(UserRole.Patient)
  @UseGuards(AuthenticatedGuard)
  @Post('saveInformationMessageAdmin')
  async saveInformationMessageAdmin(@Body() message: AdminMessage, @Req() {user}): Promise<any> {
    return this.usersService.saveInformationMessageAdmin(message, user)
  }

  @Roles(UserRole.Patient)
  @UseGuards(AuthenticatedGuard)
  @Get('adminChat/:adminChatId')
  async getAdminChat(@Query() query: AdminChatPaginationDTO): Promise<PaginationResponse> {
    return this.usersService.getAdminChatMessages(query)
  }

  @Roles(UserRole.Patient)
  @UseGuards(AuthenticatedGuard)
  @Get('unRatedOrders')
  async getUserUnratedOrders(@Req() req): Promise<UnRatedOrdersResponse> {
    return this.usersService.getUnratedOrders(req.user)
  }

}
