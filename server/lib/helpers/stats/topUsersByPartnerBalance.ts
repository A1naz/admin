import { paymenthistory } from '../../models/Paymenthistory'
import { User } from '../../models/User'
import { PartnerPaymentHistory } from '../../models/PartnerPaymentHistory'
export default async function getTopUsersByPartnerBalance(searchValue: any) {
  let top100UsersByPartnerBalance: any[] = []
  let lastDates: any[] = []

  if (!searchValue) {
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

    lastDates = await paymenthistory.aggregate([
      {
        $match: {
          user: {
            $in: top100UsersByPartnerBalance.map((user: any) => user._id),
          },
        },
      },
      {
        $sort: {
          dataoperation: -1, // Сортируем в порядке убывания, чтобы первым был самый последний dataoperation
        },
      },
      {
        $group: {
          _id: '$user',
          lastDataOperation: { $first: '$dataoperation' }, // Берем первый элемент (самый последний)
        },
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

    lastDates = await paymenthistory.aggregate([
      {
        $match: {
          user: { $in: foundUsers.map((user: any) => user._id) },
        },
      },
      {
        $sort: {
          dataoperation: -1,
        },
      },
      {
        $group: {
          _id: '$user',
          lastDataOperation: { $first: '$dataoperation' },
        },
      },
    ])
  }

  const partnerIDS = top100UsersByPartnerBalance.map((user: any) => user._id)
  const partners = await User.find({ _id: { $in: partnerIDS } })

  const partnersFormat = partners.map((partner: any) => {
    const lastDate = lastDates.find(
      (item: any) => item._id.valueOf() == partner._id.valueOf()
    )?.lastDataOperation

    const quantity = top100UsersByPartnerBalance.find(
      (item: any) => item._id.valueOf() == partner._id.valueOf()
    ).quantity

    return {
      _id: partner._id,
      username: partner.username,
      email: partner.email,
      quantity: quantity ? quantity : 0,
      lastDataOperation: lastDate ? lastDate : null,
    }
  })

  const trueFormat = partnersFormat.sort((a, b) => b.quantity - a.quantity)

  return trueFormat
}
