import { Buyout } from '../../models/Buyout'

export default async function getTopArticles() {
  const top50Articles = await Buyout.aggregate([
    {
      $group: {
        _id: '$article',
        quantity: { $sum: '$quantity' },
      },
    },
    {
      $sort: { quantity: -1 }, // Сортировка по убыванию количества
    },
    {
      $limit: 50, // Ограничение до топ-50
    },
  ])

  return top50Articles
}
