import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { Delivery } from '~/server/lib/models/avito/Delivery'
import { AdminUser } from '~/server/lib/models/AdminUser'

const runtimeConfig = useRuntimeConfig()

let paymentPerPage = 50
export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)
  const user = await AdminUser.findOne({ uuid: session.uuid })
  if (!user || (!user.mainAdmin && !user.tabs.includes('возврат и задержка')))
    return sendRedirect(event, '/auth', 302)

 const { page, sortDate, userId, dateRange, serviceId, filter }: any =
    getQuery(event)


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
      username = adminUser.username ? adminUser.username : 'неизвестно'
    }
  }
  let uuid = {}
  if (serviceId) {
    uuid = { uuidbuyout: serviceId.trim() }
  }
 let lastStatus = { $regex: /(Отказ|Возврат|Отмен)/i }
  if (filter == 'return') {
    lastStatus = { $regex: /(Возврат)/i }
  } else if (filter == 'cancel') {
    lastStatus = { $regex: /(Отказ|Отмен)/i }
  }

  const acts = await Delivery.aggregate([
    {
      $addFields: {
        lastStatus: { $arrayElemAt: ['$statusdelivery.status', -1] },
      },
    },
    {
      $match: {
        ...trueUser,
        ...trueDateRange,
        ...uuid,
        lastStatus: lastStatus,
      },
    },
  ]).sort({
    updatedAt: -1,
  })
    .skip(paymentPerPage * (+page - 1))
    .limit(paymentPerPage)


  // let acts: any = await Delivery.find({
  //   ...trueUser,
  //   ...trueDateRange,
  //   ...uuid,
  //   $expr: {
  //     $in: [
  //       { $arrayElemAt: ['$statusdelivery.status', -1] },
  //       [/Отказ/i, /Возврат/i, /Отмен/i]
  //     ]
  //   }
  // })
  //   .sort({
  //     updatedAt: sortDate,
  //   })
  //   .skip(paymentPerPage * (+page - 1))
  //   .limit(paymentPerPage)

  const usernames = await User.find({
    _id: { $in: acts.map((act: any) => act.user) },
  })
  const regex = /(Отказ|Возврат|Отмен)/i;

  const format = await Promise.all(
    acts.map(async (delivery: any) => {
      const currentstatus = delivery.statusdelivery?.length
        ? delivery.statusdelivery[delivery.statusdelivery.length - 1].status
        : 'Неизвестно'
      const user = usernames.find(
        (user: any) => user._id.valueOf() === delivery.user.valueOf()
      )

      const index = delivery.statusdelivery.findIndex((el: any) => regex.test(el.status));

      return {
        username: user ? user.username : username,
        uuid: delivery.uuidbuyout,
        article: delivery.article,
        point: delivery.point,
        statusdelivery: delivery.statusdelivery,
        date: delivery.statusdelivery?.length
          ? delivery.statusdelivery[0].date
          : '-',
        currentstatus: currentstatus,
        cancelDate: index !== -1 ? delivery.statusdelivery[index].date : '-',
        updatedAt: delivery.updatedAt,
      }
    })
  )

  const actsCount: any = 10000

  return {
    acts: format,
    count: actsCount,
  }
})
