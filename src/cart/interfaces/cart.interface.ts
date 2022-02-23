import {CartModelInterface} from '../../schemas/cart.schema';

export interface PopulatedProductCart {
  _id: string;
  status: string;
  total: number;
  prescriptions: Prescription[];
  products: Product[];
  user: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Product {
  quantity: number;
  productId: ProductId;
}

interface ProductId {
  _id: string;
  insurancePlan: string[];
  salts: string[];
  dispenseModes: string[];
  symptoms: string[];
  drugCode: string;
  packageName: string;
  strength_raw: string;
  dosageForm: string;
  unitPrice: number;
  packagePrice: number;
  manufacturer: string;
  pharmacy: string;
  pharmacyId: string;
  strength: any[];
  __v: number;
}

interface Prescription {
  quantity: number;
  prescriptionId?: any;
}

export interface CartPopulatedWithProductRes extends Omit<CartModelInterface, 'products'> {
  products: Array<{
    productId: string;
    quantity: number,
    detail: Product
  }>
}