import { paymenthistory } from '../../models/Paymenthistory'
import { User } from '../../models/User'
import { PartnerPaymentHistory } from '../../models/PartnerPaymentHistory'
export default async function getTopUsersByPartnerPayments(searchValue: any) {
  let top100UsersByPartnerPayments: any[] = []
  let lastDates: any[] = []

  if (!searchValue) {
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

    lastDates = await paymenthistory.aggregate([
      {
        $match: {
          user: {
            $in: top100UsersByPartnerPayments.map((user: any) => user._id),
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

    top100UsersByPartnerPayments = await PartnerPaymentHistory.aggregate([
      {
        $match: {
          user: { $in: foundUsers.map((user: any) => user._id) },
        },
      },
      {
        $group: {
          _id: '$user',
          quantity: { $sum: '$amount' },
        },
      },
      {
        $sort: { quantity: -1 }, 
      },
      {
        $limit: 100, 
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

  const partnerByPaymentIDS = top100UsersByPartnerPayments.map(
    (user: any) => user._id
  )
  const partnersByPayment = await User.find({
    _id: { $in: partnerByPaymentIDS },
  })

  const partnerByPaymentFormat = partnersByPayment.map((user: any) => {
    const lastDate = lastDates.find(
      (item: any) => item._id.valueOf() == user._id.valueOf()
    )?.lastDataOperation

    const quantity = top100UsersByPartnerPayments.find(
      (item: any) => item._id.valueOf() == user._id.valueOf()
    ).quantity

    return {
      _id: user.uuid,
      username: user.username,
      email: user.email,
      quantity: quantity ? quantity : 0,
      lastDataOperation: lastDate ? lastDate : null,
    }
  })

  const trueFormat = partnerByPaymentFormat.sort(
    (a, b) => b.quantity - a.quantity
  )

  return trueFormat
}
