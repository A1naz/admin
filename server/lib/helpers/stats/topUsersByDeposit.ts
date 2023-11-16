import { paymenthistory } from '../../models/Paymenthistory'
import { User } from '../../models/User'

export default async function getTopUsersByDeposit(searchValue: any) {

let top50UsersByDeposit: any[] = []
let lastDates: any[] = []

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

    lastDates = await paymenthistory.aggregate([
      {
        $match: {
          user: { $in: top50UsersByDeposit.map((user: any) => user._id) },
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

    
    lastDates = await paymenthistory.aggregate([
      {
        $match: {
          user: { $in: foundUsers.map((user: any) => user._id) },
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

  }


  const userIDS = top50UsersByDeposit.map((user: any) => user._id)
  const users = await User.find({ _id: { $in: userIDS } })

  const usersFormat = users.map((user: any) => {
    const lastDate = lastDates.find(
      (item: any) => item._id.valueOf() == user._id.valueOf()
    )?.lastDataOperation

    const quantity = top50UsersByDeposit.find(
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
 const trueFormat = usersFormat.sort((a, b) => b.quantity - a.quantity)

  return trueFormat
}
