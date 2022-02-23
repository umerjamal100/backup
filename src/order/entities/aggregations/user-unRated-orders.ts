import * as mongoose from "mongoose";
import {BucketStatusEnum, OrderStatusEnum} from "../../types/enums/order.enum";

export const findUnratedOrders = (userId: string) => {
  return [
    {
      '$match': {
        'status': OrderStatusEnum.COMPLETED,
        'orderPlacedBy': new mongoose.Types.ObjectId(userId)
      }
    }, {
      '$lookup': {
        'from': 'buckets',
        'let': {
          'buckets': '$buckets'
        },
        'as': 'unRatedBuckets',
        'pipeline': [
          {
            '$match': {
              '$expr': {
                '$and': [
                  {
                    '$in': [
                      '$_id', '$$buckets'
                    ]
                  }, {
                    '$eq': [
                      '$rating', 0
                    ]
                  }, {
                    '$eq': [
                      '$status', BucketStatusEnum.BUCKET_DELIVERED
                    ]
                  }
                ]
              }
            }
          }, {
            '$project': {
              '_id': 1,
              'aliasId': 1
            }
          }
        ]
      }
    }, {
      '$project': {
        'unRatedBuckets': 1,
        'aliasId': 1
      }
    }
  ]
}
