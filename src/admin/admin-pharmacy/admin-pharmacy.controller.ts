import {Controller, Get, Param} from '@nestjs/common';
import {AdminPharmacyService} from './admin-pharmacy.service';
import {PharmacyModelInterface} from "../../schemas/pharmacy.schema";
import {ApiUseTags} from "@nestjs/swagger";
import {LoginModelInterface} from "../../schemas/login.schema";

@ApiUseTags('Admin')
@Controller('admin-pharmacy')
export class AdminPharmacyController {
  constructor(private readonly adminPharmacyService: AdminPharmacyService) {
  }

  @Get()
  async findAll(): Promise<LoginModelInterface[]> {
    return this.adminPharmacyService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PharmacyModelInterface> {
    return this.adminPharmacyService.findOne(id);
  }

}
