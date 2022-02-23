export const findOrderCardsInDateRange = (to: string, from: string) => {
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
        'pendingOrders': [
          {
            '$addFields': {
              'size': {
                '$size': '$pendingPharmacyConfirmBucket'
              }
            }
          }, {
            '$match': {
              'size': {
                '$gt': 0
              }
            }
          }
        ],
        'waitingOnPaymentOrders': [
          {
            '$match': {
              'status': 'PAYMENT'
            }
          }
        ],
        'inProcessOrders': [
          {
            '$match': {
              'status': 'RUNNING'
            }
          }
        ],
        'completedOrders': [
          {
            '$match': {
              'status': 'COMPLETED'
            }
          }
        ],
        'rejectedOrders': [
          {
            '$match': {
              'status': 'CANCELLED'
            }
          }
        ],
        'arrivedOrders': [
          {
            '$group': {
              '_id': null,
              'count': {
                '$sum': 1
              }
            }
          }
        ]
      }
    }, {
      '$addFields': {
        'arrivedOrders': {
          '$arrayElemAt': [
            '$arrivedOrders', 0
          ]
        }
      }
    }, {
      '$addFields': {
        'pendingOrders': {
          '$size': '$pendingOrders'
        },
        'waitingOnPaymentOrders': {
          '$size': '$waitingOnPaymentOrders'
        },
        'inProcessOrders': {
          '$size': '$inProcessOrders'
        },
        'completedOrders': {
          '$size': '$completedOrders'
        },
        'rejectedOrders': {
          '$size': '$rejectedOrders'
        },
        'arrivedOrders': '$arrivedOrders.count'
      }
    }
  ]
};
