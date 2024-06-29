import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { TariffPlan } from '~/server/lib/models/TariffPlan'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session) return sendRedirect(event, '/auth', 302)

  const user = await AdminUser.findOne({ uuid: session.uuid })
  if (!user) return sendRedirect(event, '/auth', 302)

  const { dateRange, mp, searchQuery } = getQuery(event)

  console.log(dateRange);
  

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
    }).limit(40)
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
  })

  console.log(tariffs.length)

  return {
    status: 'ok',
  }
})
