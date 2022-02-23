import {Body, Controller, Get, Param, Post, Req, UseGuards} from '@nestjs/common';
import {PrescriptionService} from './prescription.service';
import {ApiUseTags} from '@nestjs/swagger';
import {AuthenticatedGuard} from '../auth/guards/Authenticated.guard';
import {CreatePrescriptionDto, PrescriptionIdDTO} from './types/dto/prescription.dto';
import {PrescriptionModelInterface} from '../schemas/prescription.schema';

@ApiUseTags('Prescription')
@Controller('prescription')
export class PrescriptionController {
  constructor(
    private readonly prescriptionService: PrescriptionService,
  ) {
  }

  @UseGuards(AuthenticatedGuard)
  @Post()
  async create(@Body() body: CreatePrescriptionDto, @Req() req): Promise<PrescriptionModelInterface> {
    return this.prescriptionService.create({...body, user: req.user});
  }

  @UseGuards(AuthenticatedGuard)
  @Get(':prescriptionId')
  async getPrescriptionById(@Param() params: PrescriptionIdDTO): Promise<PrescriptionModelInterface> {
    return this.prescriptionService.getPrescription(params.prescriptionId);
  }

}
