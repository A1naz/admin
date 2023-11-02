import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { paymenthistory } from '~/server/lib/models/Paymenthistory'
import { Buyout } from '~/server/lib/models/Buyout'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session) return sendRedirect(event, '/auth', 302)
  const user = await AdminUser.findOne({ uuid: session.uuid })
  if (!user || !user.tabs.includes('аналитика'))
    return sendRedirect(event, '/auth', 302)

  const { searchValue }: any = getQuery(event)

  const top50Buyouts = await Buyout.aggregate([
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

  const top50pvz = await Buyout.aggregate([
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

  let top50UsersByDeposit: any[] = []
  if (!searchValue) {
    top50UsersByDeposit = await paymenthistory.aggregate([
      {
        $match: {
          type: 'deposit',
        },
      },
      {
        $group: {
          _id: '$user',
          quantity: { $sum: '$summ' },
        },
      },
      {
        $sort: { quantity: -1 }, // Сортировка по убыванию количества
      },
      {
        $limit: 50, // Ограничение до топ-50
      },
    ])
  } else {
    const foundUsers = await User.find({
      $or: [
        { uuid: { $regex: searchValue, $options: 'i' } },
        { email: { $regex: searchValue, $options: 'i' } },
        { telegram: { $regex: searchValue, $options: 'i' } },
        { username: { $regex: searchValue, $options: 'i' } },
      ],
    }).limit(10)

    top50UsersByDeposit = await paymenthistory.aggregate([
      {
        $match: {
          user: { $in: foundUsers.map((user: any) => user._id) },
          type: 'deposit',
        },
      },
      {
        $group: {
          _id: '$user',
          quantity: { $sum: '$summ' },
        },
      },
      {
        $sort: { quantity: -1 }, // Сортировка по убыванию количества
      },
      {
        $limit: 50, // Ограничение до топ-50
      },
    ])
  }

  const userIDS = top50UsersByDeposit.map((user: any) => user._id)
  const users = await User.find({ _id: { $in: userIDS } })
  const usersFormat = users.map((user: any) => {
    return {
      _id: user.uuid,
      username: user.username,
      email: user.email,
      quantity: top50UsersByDeposit.find(
        (item: any) => item._id.valueOf() == user._id.valueOf()
      ).quantity,
    }
  })
  usersFormat.sort((a, b) => b.quantity - a.quantity)

  return {
    top50Buyouts,
    top50Articles,
    top50pvz,
    top50UsersByDeposit: usersFormat,
  }
})
