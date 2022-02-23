export const findInDateRangeAndGroupByField = (field: string, to: string, from: string) => {
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
      $group: {
        _id: {
          month: {
            $dateToString: {
              format: '%Y-%m',
              date: {
                $toDate: '$createdAt',
              },
            },
          },
          [field]: `$${field}`,
        },
        count: {
          $sum: 1,
        },
      },
    },
    {
      $sort: {
        month: 1,
      },
    },
  ];
};
