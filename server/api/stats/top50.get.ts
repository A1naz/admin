import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { paymenthistory } from '~/server/lib/models/Paymenthistory'
import { Buyout } from '~/server/lib/models/Buyout'
import { PartnerPaymentHistory } from '~/server/lib/models/PartnerPaymentHistory'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session) return sendRedirect(event, '/auth', 302)
  const user = await AdminUser.findOne({ uuid: session.uuid })
  if (!user || !user.tabs.includes('аналитика'))
    return sendRedirect(event, '/auth', 302)

  const { searchValue, selectedTop }: any = getQuery(event)

  let top50Buyouts: any[] = []
  if (selectedTop === 'top50Buyouts') {
    top50Buyouts = await Buyout.aggregate([
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
  }

  let top50Articles: any[] = []
  if (selectedTop === 'top50Articles') {
    top50Articles = await Buyout.aggregate([
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
  }
  let top50pvz: any[] = []
  if (selectedTop === 'top50pvz') {
    top50pvz = await Buyout.aggregate([
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
  }
  let top50UsersByDeposit: any[] = []
  let top100UsersByPartnerBalance: any[] = []
  let top100UsersByPartnerPayments: any[] = []

  if (!searchValue) {
    if (selectedTop === 'top50UsersByDeposit') {
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
    }

    if (selectedTop === 'top100UsersByPartnerPayments') {
      top100UsersByPartnerPayments = await PartnerPaymentHistory.aggregate([
        {
          $group: {
            _id: '$user',
            quantity: { $sum: '$amount' },
          },
        },
        {
          $sort: { quantity: -1 }, // Сортировка по убыванию количества
        },
        {
          $limit: 100, // Ограничение до топ-50
        },
      ])
    }

    if (selectedTop === 'top100UsersByPartnerBalance') {
      top100UsersByPartnerBalance = await User.aggregate([
        {
          $match: {
            'partner.refCount': { $gt: 0 }, // Выбираем пользователей с refCount > 0
          },
        },
        {
          $group: {
            _id: '$_id',
            quantity: { $sum: '$partner.balance' },
          },
        },
        {
          $sort: { quantity: -1 }, // Сортировка по убыванию количества
        },
        {
          $limit: 100, // Ограничение до топ-50
        },
      ])
    }
  } else {
    const foundUsers = await User.find({
      $or: [
        { uuid: { $regex: searchValue, $options: 'i' } },
        { email: { $regex: searchValue, $options: 'i' } },
        { telegram: { $regex: searchValue, $options: 'i' } },
        { username: { $regex: searchValue, $options: 'i' } },
      ],
    }).limit(10)

    console.log(foundUsers)

    if (selectedTop === 'top100UsersByPartnerPayments') {
      top100UsersByPartnerPayments = await PartnerPaymentHistory.aggregate([
        {
          $match: {
            user: { $in: foundUsers.map((user: any) => user._id) },
          }
        },
        {
          $group: {
            _id: '$user',
            quantity: { $sum: '$amount' },
          },
        },
        {
          $sort: { quantity: -1 }, // Сортировка по убыванию количества
        },
        {
          $limit: 100, // Ограничение до топ-50
        },
      ])
    }

    if (selectedTop === 'top50UsersByDeposit') {
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
    if (selectedTop === 'top100UsersByPartnerBalance') {
      top100UsersByPartnerBalance = await User.aggregate([
        {
          $match: {
            _id: { $in: foundUsers.map((user: any) => user._id) },
            'partner.refCount': { $gt: 0 }, // Выбираем пользователей с refCount > 0
          },
        },
        {
          $group: {
            _id: '$_id',
            quantity: { $sum: '$partner.balance' },
          },
        },
        {
          $sort: { quantity: -1 }, // Сортировка по убыванию количества
        },
        {
          $limit: 100, // Ограничение до топ-50
        },
      ])
    }
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

  const partnerByPaymentIDS = top100UsersByPartnerPayments.map(
    (user: any) => user._id
  )
  const partnersByPayment = await User.find({
    _id: { $in: partnerByPaymentIDS },
  })

  const partnerByPaymentFormat = partnersByPayment.map((user: any) => {
    return {
      _id: user.uuid,
      username: user.username,
      email: user.email,
      quantity: top100UsersByPartnerPayments.find(
        (item: any) => item._id.valueOf() == user._id.valueOf()
      ).quantity,
    }
  })

  partnerByPaymentFormat.sort((a, b) => b.quantity - a.quantity)

  const partnerIDS = top100UsersByPartnerBalance.map((user: any) => user._id)
  const partners = await User.find({ _id: { $in: partnerIDS } })

  const partnersFormat = partners.map((partner: any) => {
    return {
      _id: partner._id,
      username: partner.username,
      email: partner.email,
      quantity: top100UsersByPartnerBalance.find(
        (item: any) => item._id.valueOf() == partner._id.valueOf()
      ).quantity,
    }
  })

  partnersFormat.sort((a, b) => b.quantity - a.quantity)

  return {
    top50Buyouts,
    top50Articles,
    top50pvz,
    top50UsersByDeposit: usersFormat,
    top100UsersByPartnerBalance: partnersFormat,
    top100UsersByPartnerPayments: partnerByPaymentFormat,
  }
})
