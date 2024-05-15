import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { Delivery } from '~/server/lib/models/Delivery'
import { AdminUser } from '~/server/lib/models/AdminUser'

const runtimeConfig = useRuntimeConfig()

let paymentPerPage = 50
export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)
  const user = await AdminUser.findOne({ uuid: session.uuid })
  if (!user || (!user.mainAdmin && !user.tabs.includes('возврат и задержка')))
    return sendRedirect(event, '/auth', 302)

  const { page, sortDate, userId, dateRange, serviceId }: any = getQuery(event)

  let trueDateRange = {}
  if (dateRange) {
    switch (dateRange) {
      case 'today':
        trueDateRange = {
          updatedAt: {
            $gte: new Date().setHours(0, 0, 0, 0),
            $lt: new Date().setHours(23, 59, 59, 999),
          },
        }
        break
      case '3days':
        trueDateRange = {
          updatedAt: {
            $gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).setHours(
              0,
              0,
              0,
              0
            ),
            $lt: new Date().setHours(23, 59, 59, 999),
          },
        }
        break
      case '7days':
        trueDateRange = {
          updatedAt: {
            $gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).setHours(
              0,
              0,
              0,
              0
            ),
            $lt: new Date().setHours(23, 59, 59, 999),
          },
        }
        break
      case 'month':
        trueDateRange = {
          updatedAt: {
            $gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).setHours(
              0,
              0,
              0,
              0
            ),
            $lt: new Date().setHours(23, 59, 59, 999),
          },
        }
        break
    }
  }

  let trueUser = {}
  let username = ''
  if (userId) {
    const adminUser = await User.findById(userId)

    if (adminUser) {
      trueUser = { user: adminUser._id }
      username = adminUser.username
    }
  }
  let uuid = {}
  if (serviceId) {
    uuid = { uuidbuyout: serviceId.trim() }
  }
  let acts: any = await Delivery.find({
    ...trueUser,
    ...trueDateRange,
    ...uuid,
    $or: [
      { data13: { $regex: 'Отказ', $options: 'i' } },
      { data13: { $regex: 'Возврат', $options: 'i' } },
      { data13: { $regex: 'Отмен', $options: 'i' } },
    ],
  })
    .sort({
      updatedAt: sortDate,
    })
    .skip(paymentPerPage * (+page - 1))
    .limit(paymentPerPage)

  const usernames = await User.find({
    _id: { $in: acts.map((act: any) => act.user) },
  })

  const format = await Promise.all(
    acts.map(async (delivery: any) => {
      const currentstatus = delivery.statusdelivery?.length
        ? delivery.statusdelivery[delivery.statusdelivery.length - 1].status
        : 'Неизвестно'
      const user = usernames.find(
        (user: any) => user._id.valueOf() === delivery.user.valueOf()
      )
      return {
        username: user ? user.username : username,
        uuid: delivery.uuidbuyout,
        article: delivery.article,
        point: delivery.point,
        statusdelivery: delivery.statusdelivery,
        date: delivery.statusdelivery?.length
          ? delivery.statusdelivery[0].date
          : '-',
        currentstatus: delivery.data13 ? delivery.data13 : currentstatus,
        updatedAt: delivery.updatedAt,
      }
    })
  )

  const actsCount: any = await Delivery.count()

  return {
    acts: format,
    count: actsCount,
  }
})
