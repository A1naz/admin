import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { ActionHistory } from '~/server/lib/models/actionHistory'
import { AdminUser } from '~/server/lib/models/AdminUser'

const runtimeConfig = useRuntimeConfig()

let paymentPerPage = 50
export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)
  const user = await AdminUser.findOne({ uuid: session.uuid })
  if (!user || !user.tabs.includes('история действий'))
    return sendRedirect(event, '/auth', 302)

  const { page, sortDate, adminUserId, dateRange }: any = getQuery(event)

  // const users = await User.find({ _id: { $in: trueFilters.clients}})


  let trueDateRange = {}
  if (dateRange) {
    trueDateRange = {
      date: {
        $gte: new Date(JSON.parse(dateRange[0])).setHours(0, 0, 0, 0),
        $lt: new Date(JSON.parse(dateRange[1])).setHours(23, 59, 0, 0),
      },
    }
  }
  let trueUser = {}
  if (adminUserId) {
    const adminUser = await AdminUser.findById(adminUserId)

    if (adminUser) {
      trueUser = { adminUser: adminUser._id }
    }
  }
  let acts: any = await ActionHistory.find({
    ...trueUser,
    ...trueDateRange,
  })
    .sort({
      date: sortDate,
    })
    .skip(paymentPerPage * (+page - 1))
    .limit(paymentPerPage)

  const actsCount: any = await ActionHistory.count()

  const format = <any>[]

  //   await ActionHistory.create({
  //     adminUser: user._id,
  //     actionId: 21,
  //     actionDescription: `Получение историй действий`,
  //     date: new Date(),
  //   })

  return {
    acts: acts,
    count: actsCount,
  }
})
