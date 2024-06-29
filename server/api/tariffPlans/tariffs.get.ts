import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { TariffPlan } from '~/server/lib/models/TariffPlan'
const limit = 50

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session) return sendRedirect(event, '/auth', 302)

  const user = await AdminUser.findOne({ uuid: session.uuid })
  if (!user) return sendRedirect(event, '/auth', 302)

  const { dateRange, mp, searchQuery, page }: any = getQuery(event)

  const dateRangeParam: Object = dateRange
    ? {
        activationDate: {
          $lte: new Date(JSON.parse(dateRange[0])),
        },
        endDate: {
          $gte: new Date(JSON.parse(dateRange[1])),
        },
      }
    : {}

  const searchQueryParam: Object = searchQuery
    ? {
        $or: [
          { username: { $regex: searchQuery, $options: 'i' } },
          { orgName: { $regex: searchQuery, $options: 'i' } },
        ],
      }
    : {}

  let users: any = []
  if (searchQuery) {
    users = await User.find({
      ...searchQueryParam,
    }).limit(50)
  }

  const allowedUsersParam: Object = user.isAllUsersAllowed
    ? {}
    : {
        user: { $in: user.allowedUsers.map((id: any) => id) },
      }

  const tariffs = await TariffPlan.find({
    ...allowedUsersParam,
    user: users.length
      ? { $in: users.map((item: any) => item._id) }
      : { $exists: true },
    ...dateRangeParam,
    mp: mp == 'all' ? { $exists: true } : mp,
  })
    .limit(limit)
    .skip((page - 1) * limit)
    .sort({ activationDate: -1 })

  users = await User.find({
    _id: { $in: tariffs.map((item: any) => item.user) },
  })

  console.log(users.length)

  return {
    status: 'ok',
  }
})
