import {Types} from 'mongoose';

export const MockedBucket = {
  _id: "5f940c7f6d66e17311e159d6",
  status: "WAITING_USER_PREVIEW_CONFIRMATION",
  prescription: {
    _id: new Types.ObjectId(),
    user: new Types.ObjectId(),
    url: 'https://deep-dive-test-profiles.s3.ap-south-1.amazonaws.com/deepDive_1598004880917_1jXb_zedge.jpg'
  },
  products: [
    {
      product: {
        "_id": "5f940c7f6d66e17311e159d6",
        "insurancePlan": [
          "AD Basic Plan"
        ],
        "salts": [
          "ambroxol hydrochloride"
        ],
        "dispenseModes": [
          "Ph-OM"
        ],
        "symptoms": [
          "Cough"
        ],
        "drugCode": "C86-3423-00262-01",
        "packageName": "MUCOSOLVAN",
        "strength_raw": "30 mg/5ml",
        "dosageForm": "Syrup (Sugar Free)",
        "unitPrice": 16.5,
        "packagePrice": 16.5,
        "manufacturer": "Boehringer Ingelheim, FRANCE",
        "pharmacy": "kjhgfghjk",
        "pharmacyId": "5f940c6b6d66e17311e159bf",
        "internalId": "0cf082e6-8870-4a82-9fa5-3bf548e6b7df",
        "category": "Antimalarial",
        "strength": [],
        "__v": 0
      },
      quantity: 2,
    },
    {
      product: {
        "_id": "5f940c7f6d66e17311e159d6",
        "insurancePlan": [
          "AD Basic Plan"
        ],
        "salts": [
          "ambroxol hydrochloride"
        ],
        "dispenseModes": [
          "Ph-OM"
        ],
        "symptoms": [
          "Cough"
        ],
        "drugCode": "C86-3423-00262-01",
        "packageName": "MUCOSOLVAN",
        "strength_raw": "30 mg/5ml",
        "dosageForm": "Syrup (Sugar Free)",
        "unitPrice": 16.5,
        "packagePrice": 16.5,
        "manufacturer": "Boehringer Ingelheim, FRANCE",
        "pharmacy": "kjhgfghjk",
        "pharmacyId": "5f940c6b6d66e17311e159bf",
        "internalId": "0cf082e6-8870-4a82-9fa5-3bf548e6b7df",
        "category": "Antimalarial",
        "strength": [],
        "__v": 0
      },
      quantity: 3,
    }
  ],
  pharmacy: "5f9867d9e3f318792ebd33b7",
  cart: "5f9867d9e3f318792ebd33b7",
  orderId: "5f9867d9e3f318792ebd33b7",
}