import { getServerSession } from '#auth'
import { User } from '~~/server/lib/models/User'
import { AdminUser } from '~~/server/lib/models/AdminUser'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session) return sendRedirect(event, '/auth', 302)

  const user = await AdminUser.findOne({ uuid: session.uuid })

  const { dateRange }: any = getQuery(event)

  const dateRangeParam: Object = dateRange
    ? {
      registrationDate: {
          $gte: new Date(JSON.parse(dateRange[0])),
          $lte: new Date(JSON.parse(dateRange[1])),
        },
      }
    : {}
    
  if (!user || (!user.mainAdmin && !user.tabs.includes('лендинг')))
    return sendRedirect(event, '/auth', 302)

  const info = await User.aggregate([
    {
      $match: {
        landing: { $exists: true },
        ...dateRangeParam,
      },
    },

    {
      $group: {
        _id: '$landing', // Группируем по полю "landing"
        count: { $sum: 1 }, // Считаем количество пользователей в каждой группе
      },
    },
  ])

  if (!info || !info.length) return []

  const format: any = info.map((el: any) => {
    return {
      landing: el._id,
      count: el.count,
    }
  })

  return format
})
