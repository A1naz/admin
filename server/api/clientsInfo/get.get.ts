import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { AdminUser } from '~/server/lib/models/AdminUser'
import getUsers from './getUsersByStatus'
const limit = 50

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session) return sendRedirect(event, '/auth', 302)

  const user = await AdminUser.findOne({ uuid: session.uuid })

  if (!user || (!user.mainAdmin && !user.tabs.includes('клиенты')))
    return sendRedirect(event, '/auth', 302)

  const { dateRange, searchQuery, page, status }: any = getQuery(event)

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

  let users = []
  if (status === 'active') {
    console.log('active');
    users = await getUsers.activeUsers(page, searchQueryParam)
  } else if (status === 'inactive') {
    console.log('inactive');
    users = await getUsers.inactiveUsers(page, searchQueryParam)
  } else { 
    console.log('registered');
    users = await getUsers.registeredUsers(page, searchQueryParam)
  }

  return users
})
