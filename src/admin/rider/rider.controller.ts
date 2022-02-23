import {Controller, Get, Query, Req} from '@nestjs/common';
import {RiderService} from './rider.service';
import {ApiUseTags} from "@nestjs/swagger";
import {PaginationResponse} from "../../common/responses.common";
import {RiderPaginationDto} from "./dto/rider.dto";

@ApiUseTags('Admin')
@Controller('admin/riders')
export class RiderController {
  constructor(private readonly riderService: RiderService) {
  }

  @Get('')
  async getRiders(@Query() query: RiderPaginationDto, @Req() {user}): Promise<PaginationResponse> {
    return this.riderService.getRiders(query)
  }

}
