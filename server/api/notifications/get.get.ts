import { getServerSession } from '#auth'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { Notification } from '~/server/lib/models/Notification'

const limit = 50

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session) return sendRedirect(event, '/auth', 302)

  const user = await AdminUser.findOne({ uuid: session.uuid })

  if (!user || (!user.mainAdmin && !user.tabs.includes('ручные уведомления')))
    return sendRedirect(event, '/auth', 302)

  const { page = 1, searchQuery = '', dateRange }: any = getQuery(event)
  let dateRangeFilter: any = {}
  switch (dateRange) {
    case 'today':
      dateRangeFilter = {
        activationDate: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      }
      break
    case 'yesterday':
      dateRangeFilter = {
        activationDate: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0) - 86400000),
          $lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      }
      break
    case 'threeDaysAgo':
      dateRangeFilter = {
        activationDate: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0) - 86400000 * 3),
          $lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      }
      break
    case 'sevenDaysAgo':
      dateRangeFilter = {
        activationDate: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0) - 86400000 * 7),
          $lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      }
      break
    case '30DaysAgo':
      dateRangeFilter = {
        activationDate: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0) - 86400000 * 30),
          $lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      }
      break
  }

  const notifications = await Notification.find({
    ...dateRangeFilter,
    $or: [
      { category: { $regex: searchQuery, $options: 'i' } },
      { text: { $regex: searchQuery, $options: 'i' } },
    ],
  })
    .sort({ _id: -1 })
    .skip((page - 1) * limit)
    .limit(limit)

  if (!notifications) return []
  return notifications
})
