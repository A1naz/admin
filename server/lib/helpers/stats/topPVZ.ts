import { Buyout } from '../../models/Buyout'

export default async function getTopPVZ() {
  const top50PVZ = await Buyout.aggregate([
    {
      $group: {
        _id: '$point',
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

  return top50PVZ
}
