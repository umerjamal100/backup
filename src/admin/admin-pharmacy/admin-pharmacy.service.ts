import {Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {PharmacyModelInterface, PharmacyModelStructure} from "../../schemas/pharmacy.schema";
import {PharmacyService} from "../../pharmacy/pharmacy.service";
import {LoginModelInterface, LoginModelStructure} from "../../schemas/login.schema";

@Injectable()
export class AdminPharmacyService {
  constructor(
    @InjectModel('Pharmacy')
    private readonly pharmacyModel: Model<PharmacyModelStructure>,
    @InjectModel('Login')
    private readonly loginModel: Model<LoginModelStructure>,
    private readonly pharmacyService: PharmacyService
  ) {
  }

  async findAll(): Promise<LoginModelInterface[]> {
    return this.loginModel.find().populate("user");
  }

  async findOne(id: string): Promise<PharmacyModelInterface> {
    return this.pharmacyService.getPharmacyById(id)
  }
}
