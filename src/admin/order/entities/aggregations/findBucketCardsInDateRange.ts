import {IN_TRANSIT_BUCKETS} from "../../../../common/constants.common";

export const findBucketCardsInDateRange = (to: string, from: string) => {
  return [
    {
      $match: {
        createdAt: {
          $gte: new Date(from),
          $lte: new Date(to),
        },
      },
    },
    {
      '$facet': {
        'readyToDeliverOrders': [
          {
            '$match': {
              'status': 'WAITING_FOR_RIDER_CONFIRMATION'
            }
          }
        ],
        'inTransitOrders': [
          {
            '$match': {
              'status': {
                '$in': IN_TRANSIT_BUCKETS
              }
            }
          }
        ]
      }
    }, {
      '$addFields': {
        'inTransitOrders': {
          '$size': '$inTransitOrders'
        },
        'readyToDeliverOrders': {
          '$size': '$readyToDeliverOrders'
        }
      }
    }]
};
