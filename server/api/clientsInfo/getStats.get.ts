import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { paymenthistory } from '~/server/lib/models/Paymenthistory'

const limit = 50

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session) return sendRedirect(event, '/auth', 302)

  const admin = await AdminUser.findOne({ uuid: session.uuid })

  if (!admin || (!admin.mainAdmin && !admin.tabs.includes('клиенты')))
    return sendRedirect(event, '/auth', 302)

  const { uuid, dateRange }: any = getQuery(event)

  // ✅ FIX: Обработка JSON.parse с try-catch
  let dateRangeFilter = {}
  if (dateRange) {
    try {
      const startDate = new Date(JSON.parse(dateRange[0]))
      const endDate = new Date(JSON.parse(dateRange[1]))
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Invalid date')
      }
      
      dateRangeFilter = {
        dataoperation: {
          $gte: new Date(startDate.setHours(0, 0, 0, 0)),
          $lte: new Date(endDate.setHours(23, 59, 59, 999)),
        },
      }
    } catch (e) {
      throw createError({
        statusCode: 400,
        message: 'Invalid date range format',
      })
    }
  }

  const user = await User.findOne({
    uuid,
  })

  if (!user)
    throw createError({
      statusCode: 400,
      message: 'Пользователь не найден',
    })

  const res = {
    profit: 0,
    buyoutsCount: 0,
    reviewsCount: 0,
    turnOver: 0,
  }

  const profit = await paymenthistory.aggregate([
    {
      $match: {
        user: user._id,
        type: { $in: ['buyouts service', 'review'] },
        ...dateRangeFilter,
      },
    },
    {
      $group: {
        _id: '$service',
        summ: {
          $sum: '$summ',
        },
      },
    },
  ])
  const turnOver = await paymenthistory.aggregate([
    {
      $match: {
        user: user._id,
        type: 'deposit',
        ...dateRangeFilter,
      },
    },
    {
      $group: {
        _id: '$service',
        summ: {
          $sum: '$summ',
        },
      },
    },
  ])

  if (turnOver && turnOver.length > 0 && turnOver[0] && turnOver[0].summ) {
    res.turnOver = turnOver[0].summ
  }

  if (profit && profit.length > 0 && profit[0] && profit[0].summ) {
    res.profit = profit[0].summ
  }

  const buyoutsCount = await paymenthistory.countDocuments({
    user,
    type: 'buyouts service',
    ...dateRangeFilter,
  })

  if (buyoutsCount) {
    res.buyoutsCount = buyoutsCount
  }

  const reviewsCount = await paymenthistory.countDocuments({
    user,
    type: 'review',
    ...dateRangeFilter,
  })

  if (reviewsCount) {
    res.reviewsCount = reviewsCount
  }

  return res
})
