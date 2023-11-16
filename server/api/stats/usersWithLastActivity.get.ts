import { getServerSession } from '#auth'
import { User } from '@/server/lib/models/User'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { paymenthistory } from '~/server/lib/models/Paymenthistory'
const itemsPerPage = 100

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session) return sendRedirect(event, '/auth', 302)
  const user = await AdminUser.findOne({ uuid: session.uuid })
  if (!user || !user.tabs.includes('аналитика'))
    return sendRedirect(event, '/auth', 302)

  const { searchValue, sortDate, pageNumber }: any = getQuery(event)

  let lastDates: any[] = []
  let matchFilter = null
  let aggregatePipeline: any[] = []
  if (searchValue) {
    const foundUsers = await User.find({
      $or: [
        { username: { $regex: searchValue, $options: 'i' } },
        { email: { $regex: searchValue, $options: 'i' } },
        { telegram: { $regex: searchValue, $options: 'i' } },
        { uuid: { $regex: searchValue, $options: 'i' } },
      ],
    }).limit(50)

    aggregatePipeline.unshift({
      $match: {
        user: { $in: foundUsers.map((user: any) => user._id) },
      },
    })
  }

  if (sortDate == '1') {
    aggregatePipeline = [
      ...aggregatePipeline,
      {
        $sort: {
          dataoperation: 1, // Сортировка по возрастанию для первого случая
        },
      },
      {
        $group: {
          _id: '$user',
          lastDataOperation: { $last: '$dataoperation' }, // Теперь используем $last для получения последнего элемента
        },
      },
      {
        $sort: {
          lastDataOperation: 1, // Сортировка по убыванию для последнего действия
        },
      },
      {
        $skip: (pageNumber - 1) * itemsPerPage,
      },
      {
        $limit: itemsPerPage,
      },
    ]

    lastDates = await paymenthistory.aggregate(aggregatePipeline)
  } else {
    aggregatePipeline = [
      ...aggregatePipeline,
      {
        $sort: {
          dataoperation: 1, // Сортировка по возрастанию для первого случая
        },
      },
      {
        $group: {
          _id: '$user',
          lastDataOperation: { $last: '$dataoperation' }, // Теперь используем $last для получения последнего элемента
        },
      },
      {
        $sort: {
          lastDataOperation: -1, // Сортировка по убыванию для последнего действия
        },
      },
      {
        $skip: (pageNumber - 1) * itemsPerPage,
      },
      {
        $limit: itemsPerPage,
      },
    ]
    lastDates = await paymenthistory.aggregate(aggregatePipeline)
  }

  const userIds: any[] = lastDates.map((lastDate: any) => lastDate._id)
  const users = await User.find({ _id: { $in: userIds } })

  const format = users.map((user: any) => {
    const lastDate = lastDates.find(
      (item: any) => item._id.valueOf() == user._id.valueOf()
    )
    return {
      _id: user.uuid,
      username: user.username,
      email: user.email,
      lastDataOperation: lastDate ? new Date(lastDate.lastDataOperation) : null,
    }
  })
  let sorted: any[] = []
  if (sortDate == '-1') {
    sorted = format.sort(
      (a: any, b: any) => b.lastDataOperation - a.lastDataOperation
    )
  } else {
    sorted = format.sort(
      (a: any, b: any) => a.lastDataOperation - b.lastDataOperation
    )
  }

  return sorted
})
