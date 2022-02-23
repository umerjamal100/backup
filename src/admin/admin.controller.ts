import {Body, Controller, Get, Patch, Post, Query, Req} from '@nestjs/common';
import {ApiUseTags} from "@nestjs/swagger";
import {Roles} from "../auth/decorators/roles.decorator";
import {UserRole} from "../common/enum.common";
import {AdminService} from "./admin.service";
import {
  AdminInformationChatHeadsDTO,
  AdminOrderChatHeadsDTO,
  PatchAdminChatDTO,
  PatchAdminDTO
} from "./types/admin.dto";
import {AdminChatPaginationDTO, AdminMessage} from "../users/types/dto/user.dto";
import {PaginationResponse} from "../common/responses.common";

@ApiUseTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService
  ) {
  }

  @Roles(UserRole.Admin)
  @Get('admin')
  async getAdmin(@Body() body: PatchAdminDTO, @Req() req): Promise<any> {
    return this.adminService.findOneAdmin(req.user.toString())
  }

  @Roles(UserRole.SubAdmin)
  @Get('subAdmin')
  async getSubAdmin(@Body() body: PatchAdminDTO, @Req() req): Promise<any> {
    return this.adminService.findOneSubAdmin(req.user.toString())
  }

  @Roles(UserRole.Admin)
  @Get('adminOrderChatHeads')
  async getAdminOrderChatHeads(@Query() body: AdminOrderChatHeadsDTO, @Req() {user}): Promise<any> {
    return this.adminService.getAdminOrderChatHeads(body)
  }

  @Roles(UserRole.Admin)
  @Get('adminInformationChatHeads')
  async getAdminInformationChatHeads(@Query() body: AdminInformationChatHeadsDTO, @Req() req): Promise<any> {
    return this.adminService.getAdminInformationChatHeads(body)
  }

  @Roles(UserRole.Admin)
  @Patch('adminOrderChat')
  async patchAdminOrderChat(@Body() body: PatchAdminChatDTO, @Req() req): Promise<any> {
    return this.adminService.patchAdminOrderChat(body)
  }

  @Roles(UserRole.Admin)
  @Patch('adminPharmacyOrderChat')
  async patchAdminPharmacyOrderChat(@Body() body: PatchAdminChatDTO, @Req() req): Promise<any> {
    return this.adminService.patchAdminPharmacyOrderChat(body)
  }

  @Roles(UserRole.Admin)
  @Patch('adminInformationChat')
  async patchAdminInformationChat(@Body() body: PatchAdminChatDTO, @Req() req): Promise<any> {
    return this.adminService.patchAdminInformationChat(body)
  }

  @Roles(UserRole.Admin)
  @Post('saveOrderMessageAdmin')
  async sendMessageAdmin(@Body() message: AdminMessage, @Req() {user}): Promise<any> {
    return this.adminService.saveOrderMessageAdmin(message, user)
  }

  @Roles(UserRole.Admin)
  @Post('savePharmacyOrderMessageAdmin')
  async savePharmacyOrderMessageAdmin(@Body() message: AdminMessage, @Req() {user}): Promise<any> {
    return this.adminService.savePharmacyOrderMessageAdmin(message, user)
  }

  @Roles(UserRole.Admin)
  @Post('saveInformationMessageAdmin')
  async saveInformationMessageAdmin(@Body() message: AdminMessage, @Req() {user}): Promise<any> {
    return this.adminService.saveInformationMessageAdmin(message, user)
  }

  @Roles(UserRole.Admin)
  @Get('adminChat/:adminChatId')
  async getAdminChat(@Query() query: AdminChatPaginationDTO): Promise<PaginationResponse> {
    return this.adminService.getAdminChatMessages(query)
  }

  @Roles(UserRole.Admin)
  @Patch('admin')
  async patchAdmin(@Body() body: PatchAdminDTO, @Req() req): Promise<any> {
    return this.adminService.patchAdmin(body, req.user)
  }

  @Roles(UserRole.SubAdmin)
  @Patch('subAdmin')
  async patchSubAdmin(@Body() body: PatchAdminDTO, @Req() req): Promise<any> {
    return this.adminService.patchSubAdmin(body, req.user)
  }

}
