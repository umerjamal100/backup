import {Body, Controller, Get, Patch, Post, Req, UseGuards} from '@nestjs/common';
import {ApiUseTags} from '@nestjs/swagger';
import {RiderService} from "./rider.service";
import {CreateRiderDTO, CurrentLocationDTO, PatchRiderDTO, RiderOrderAcceptanceDTO} from "./types/dto/rider.dto";
import {Roles} from "../auth/decorators/roles.decorator";
import {UserRole} from "../common/enum.common";
import {RiderBucketModelInterface} from "../schemas/riderBucket.schema";
import {RiderBucketService} from "../order/riderBucket.service";
import {RiderBucketPatchDTO} from "../order/types/dto/riderBucker.dto";
import {AuthenticatedGuard} from "../auth/guards/Authenticated.guard";

@ApiUseTags('Rider')
@Controller('rider')
export class RiderController {
  constructor(
    private readonly riderService: RiderService,
    private readonly riderBucketService: RiderBucketService,
  ) {
  }

  @Post('')
  async createRider(@Body() body: CreateRiderDTO): Promise<any> {
    await this.riderService.createRider(body)
  }

  @Roles(UserRole.Rider)
  @Patch('')
  async patchRider(@Body() body: PatchRiderDTO, @Req() req): Promise<any> {
    return this.riderService.patchRider(body, req.user)
  }

  @Roles(UserRole.Rider)
  @Patch('/order/acceptance')
  async orderAcceptance(@Body() body: RiderOrderAcceptanceDTO, @Req() req): Promise<RiderBucketModelInterface> {
    return this.riderService.orderAcceptance(body, req.user)
  }

  @Roles(UserRole.Rider)
  @Get('/pendingBuckets')
  async myPendingBuckets(@Req() req): Promise<RiderBucketModelInterface> {
    return this.riderService.myPendingBuckets(req.user)
  }

  @Roles(UserRole.Rider)
  @Get('/myBuckets')
  async myBuckets(@Req() req): Promise<RiderBucketModelInterface> {
    return this.riderService.myBuckets(req.user)
  }

  @Roles(UserRole.Rider)
  @Get('/currentContract')
  async currentContract(@Req() req): Promise<RiderBucketModelInterface> {
    return this.riderService.currentContract(req.user)
  }

  @Roles(UserRole.Rider)
  @Patch('/currentContract/timeEstimations')
  async currentContractTimeEstimations(@Body() body: CurrentLocationDTO, @Req() req): Promise<RiderBucketModelInterface> {
    return this.riderService.currentContractTimeEstimations(body, req.user)
  }

  @Patch('bucket')
  async patchRiderBucket(@Body() body: RiderBucketPatchDTO) {
    return this.riderBucketService.patchRiderBucket(body)
  }

  @UseGuards(AuthenticatedGuard)
  @Post('testRating')
  async testRating(@Req() req): Promise<any> {
    return await this.riderService.addRiderDeliveredBuckets('6082957ed346f655a0b37344');
  }
}
