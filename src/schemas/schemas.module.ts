import {Module, Provider} from '@nestjs/common';
import {getModelToken, MongooseModule} from '@nestjs/mongoose';
import {UserSchemaProvider} from './user.schema';
import {AddressSchema} from './address.schema';
import {SequenceSchema} from './sequence.schema';
import {MedicinePharmacySchema} from './Pharmacy-medicine.schema';
import {MedicineSchema} from './medicine.schema';
import {PharmacySchema} from './pharmacy.schema';
import {ProductSchemaProvider} from './product.schema';
import {ConfigService} from '../config/config.service';
import {DocumentsSchema} from './document.schema';
import {PrescriptionSchema} from './prescription.schema';
import {CartSchema} from './cart.schema';
import {OrderSchema} from './order.schema';
import {LoginSchema} from './login.schema';
import {BucketSchema} from './bucket.schema';
import {RiderSchema} from "./rider.schema";
import {PaymentBucketSchema} from "./paymentBucket.schema";
import {RiderBucketSchema} from "./riderBucket.schema";
import {ScheduledOrderSchema} from "./scheduledOrderSchema";
import {AdministrationSchema, AdminSchema, SubAdminSchema} from "./admin.schema";
import {ChatBucketSchema} from "./chatBucket.schema";
import {AdminChatSchema, InformationChatSchema, OrderChatSchema, PharmacyOrderChatSchema} from "./adminChatSchema";
import {AdminChatMessageSchema} from "./adminChatMessage.schema";
import {AdvertisementSchema, PromotionSchema} from "./promotion.schema";
import {RequestAdvertisementSchema, RequestPromotionSchema} from "./requestPromotion.schema";


const schemasArray = [
  // MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
  MongooseModule.forFeature([{name: 'Address', schema: AddressSchema}]),
  MongooseModule.forFeature([{name: 'Sequence', schema: SequenceSchema}]),
  MongooseModule.forFeature([{name: 'Pharmacy', schema: PharmacySchema}]),
  MongooseModule.forFeature([{name: 'Medicine', schema: MedicineSchema}]),
  MongooseModule.forFeature([{name: 'MedicinePharmacy', schema: MedicinePharmacySchema}]),
  MongooseModule.forFeature([{name: 'Token', schema: {}}]),
  MongooseModule.forFeature([{name: 'Document', schema: DocumentsSchema}]),
  MongooseModule.forFeature([{name: 'Prescription', schema: PrescriptionSchema}]),
  MongooseModule.forFeature([{name: 'Session', schema: {}}]),
  MongooseModule.forFeature([{name: 'Cart', schema: CartSchema}]),
  MongooseModule.forFeature([{name: 'Order', schema: OrderSchema}]),
  MongooseModule.forFeature([{name: 'Login', schema: LoginSchema}]),
  MongooseModule.forFeature([{name: 'Bucket', schema: BucketSchema}]),
  MongooseModule.forFeature([{name: 'Rider', schema: RiderSchema}]),
  MongooseModule.forFeature([{name: 'PaymentBucket', schema: PaymentBucketSchema}]),
  MongooseModule.forFeature([{name: 'RiderBucket', schema: RiderBucketSchema}]),
  MongooseModule.forFeature([{name: 'ScheduledOrder', schema: ScheduledOrderSchema}]),
  MongooseModule.forFeature([{name: 'Admin', schema: AdministrationSchema}]),
  MongooseModule.forFeature([{name: 'ChatBucket', schema: ChatBucketSchema}]),
  MongooseModule.forFeature([{name: 'AdminChat', schema: AdminChatSchema}]),
  MongooseModule.forFeature([{name: 'AdminChatMessage', schema: AdminChatMessageSchema}]),
  MongooseModule.forFeature([{name: 'Promotion', schema: PromotionSchema}]),
  MongooseModule.forFeature([{name: 'RequestPromotion', schema: RequestPromotionSchema}]),
  MongooseModule.forFeatureAsync([{
    name: 'User',
    useFactory: UserSchemaProvider,
  }]),
  MongooseModule.forFeatureAsync([{
    name: 'Product',
    useFactory: ProductSchemaProvider,
    inject: [ConfigService],
  }]),
];

const administrationProvider: Provider[] = [{
  provide: getModelToken('admin'),
  useFactory: (administrationModel) => administrationModel.discriminator('admin', AdminSchema),
  inject: [getModelToken('Admin')]
}, {
  provide: getModelToken('subAdmin'),
  useFactory: (administrationModel) => administrationModel.discriminator('subAdmin', SubAdminSchema),
  inject: [getModelToken('Admin')]
}]

const AdminChatBucketProvider: Provider[] = [{
  provide: getModelToken('adminOrderChat'),
  useFactory: (adminChatBucketModel) => adminChatBucketModel.discriminator('order', OrderChatSchema),
  inject: [getModelToken('AdminChat')]
}, {
  provide: getModelToken('adminPharmacyOrderChat'),
  useFactory: (adminChatBucketModel) => adminChatBucketModel.discriminator('pharmacyOrder', PharmacyOrderChatSchema),
  inject: [getModelToken('AdminChat')]
}, {
  provide: getModelToken('adminInformationChat'),
  useFactory: (adminChatBucketModel) => adminChatBucketModel.discriminator('information', InformationChatSchema),
  inject: [getModelToken('AdminChat')]
}]

const PromotionProvider: Provider[] = [{
  provide: getModelToken('advertisement'),
  useFactory: (advertisementModel) => advertisementModel.discriminator('advertisement', AdvertisementSchema),
  inject: [getModelToken('Promotion')]
},]

const RequestPromotionProvider: Provider[] = [{
  provide: getModelToken('reqAdvertisement'),
  useFactory: (requestAdvertisementModel) => requestAdvertisementModel.discriminator('reqAdvertisement', RequestAdvertisementSchema),
  inject: [getModelToken('RequestPromotion')]
},]

@Module({
  imports: [
    ...schemasArray,
  ],
  providers: [...administrationProvider, ...AdminChatBucketProvider, ...PromotionProvider, ...RequestPromotionProvider],
  exports: [
    ...schemasArray,
    ...administrationProvider,
    ...AdminChatBucketProvider,
    ...PromotionProvider,
    ...RequestPromotionProvider
  ],
})
export class SchemasModule {
}
