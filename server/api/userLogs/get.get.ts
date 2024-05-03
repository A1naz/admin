import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { UserLogs } from '~/server/lib/models/UserLogs'
import { AdminUser } from '~/server/lib/models/AdminUser'

const runtimeConfig = useRuntimeConfig()

let paymentPerPage = 50
export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)
  const user = await AdminUser.findOne({ uuid: session.uuid })
  if (!user && !user.tabs.includes('история действий пользователей'))
    return sendRedirect(event, '/auth', 302)

  const { page, sortDate, adminUserId, dateRange }: any = getQuery(event)
  // console.log('sortDate', sortDate, 'adminUserId', adminUserId, 'dateRange', dateRange)
  // const users = await User.find({ _id: { $in: trueFilters.clients}})


  let trueDateRange = {}
  if (dateRange) {
    trueDateRange = {
      createdAt: {
        $gte: new Date(JSON.parse(dateRange[0])).setHours(0, 0, 0, 0),
        $lt: new Date(JSON.parse(dateRange[1])).setHours(23, 59, 0, 0),
      },
    }
  }
  let trueUser = {}
  if (adminUserId) {
    const adminUser = await User.findById(adminUserId)

    if (adminUser) {
      trueUser = { userId: adminUser._id }
    }
  }
  let acts: any = await UserLogs.find({
    ...trueUser,
    ...trueDateRange,
  })
    .sort({
      createdAt: sortDate,
    })
    .skip(paymentPerPage * (+page - 1))
    .limit(paymentPerPage)
  
  // if(adminUserId)console.log('acts', acts)

  const actsCount: any = await UserLogs.count()

  const format = <any>[]

  return {
    acts: acts,
    count: actsCount,
  }
})
