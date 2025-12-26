import { getServerSession } from '#auth'
import { User } from '@/server/lib/models/User'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { paymenthistory } from '~/server/lib/models/Paymenthistory'
import { ActionHistory } from '~/server/lib/models/actionHistory'
import { sanitizeSearchQuery } from '~/server/utils/sanitizeRegex'

const itemsPerPage = 100

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session) return sendRedirect(event, '/auth', 302)
  const user = await AdminUser.findOne({ uuid: session.uuid })
  if (!user || !user.tabs.includes('аналитика'))
    return sendRedirect(event, '/auth', 302)

  const { searchValue, sortDate, pageNumber }: any = getQuery(event)
  
  // ✅ FIX: Санитизация searchValue для защиты от ReDoS
  const safeSearchValue = sanitizeSearchQuery(searchValue || '', 100)

  const allowedUsersParamForUser = user.isAllUsersAllowed
  ? {
      _id: { $nin: user.restrictedUsers.map((id: any) => id) },
    }
  : {
      $and: [
        { _id: { $in: user.allowedUsers.map((id: any) => id) } },
        { _id: { $nin: user.restrictedUsers.map((id: any) => id) } },
      ],
    }
  const allowedUsersParam = user.isAllUsersAllowed
  ? {
      user: { $nin: user.restrictedUsers.map((id: any) => id) },
    }
  : {
      $and: [
        { user: { $in: user.allowedUsers.map((id: any) => id) } },
        { user: { $nin: user.restrictedUsers.map((id: any) => id) } },
      ],
    }
      
  let lastDates: any[] = []
  let matchFilter = null
  let aggregatePipeline: any[] = []
  if (searchValue) {
    const foundUsers = await User.find({
      ...allowedUsersParamForUser,
      $or: [
        { username: { $regex: safeSearchValue, $options: 'i' } },
        { email: { $regex: safeSearchValue, $options: 'i' } },
        { telegram: { $regex: safeSearchValue, $options: 'i' } },
        { uuid: { $regex: safeSearchValue, $options: 'i' } },
      ],
    }).limit(50)

    aggregatePipeline.unshift({
      $match: {
        user: { $in: foundUsers.map((user: any) => user._id) },
      },
    })
  } else {
    aggregatePipeline.unshift({
      $match: allowedUsersParam,
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

  await ActionHistory.create({
    adminUser: user._id,
    actionId: 32,
    actionDescription: `Админ ${user.uuid} - ${user.username} получил информацию о последних активных пользователях`,
    date: new Date(),
  })

  return sorted
})
