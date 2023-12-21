import { Buyout } from '../../models/Buyout'

export default async function getTopBuyouts(allowedUsersParam: any) {

  const top50Buyouts = await Buyout.aggregate([
    {
      $match: allowedUsersParam,
    },
    {
      $group: {
        _id: '$article',
        quantity: { $sum: 1 },
      },
    },
    {
      $sort: { quantity: -1 }, // Сортировка по убыванию количества
    },
    {
      $limit: 50, // Ограничение до топ-50
    },
  ])

  return top50Buyouts
}
