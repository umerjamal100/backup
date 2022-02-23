export const findInRangeDateAggregatedHourly = (to: string, from: string) => {
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
      $lookup: {
        from: 'buckets',
        localField: 'buckets',
        foreignField: '_id',
        as: 'buckets',
      },
    },
    {
      $addFields: {
        buckets: {
          $arrayElemAt: ['$buckets', 0],
        },
      },
    },
    {
      $lookup: {
        from: 'paymentbuckets',
        localField: 'buckets.paymentBucket',
        foreignField: '_id',
        as: 'paymentBucket',
      },
    },
    {
      $addFields: {
        paymentBucket: {
          $arrayElemAt: ['$paymentBucket', 0],
        },
      },
    },
    {
      $group: {
        _id: {
          day: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: {
                $toDate: '$createdAt',
              },
            },
          },
          type: '$paymentBucket.type',
        },
        count: {
          $sum: 1,
        },
      },
    },
    {
      $match: {
        '_id.type': {
          $ne: null,
        },
      },
    },
  ];
};
