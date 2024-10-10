import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { AdminUser } from '~/server/lib/models/AdminUser'
import getUsers from './getUsersByStatus'
import { ActionHistory } from '~/server/lib/models/actionHistory'

const limit = 50

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session) return sendRedirect(event, '/auth', 302)

  const user = await AdminUser.findOne({ uuid: session.uuid })

  if (!user || (!user.mainAdmin && !user.tabs.includes('клиенты')))
    return sendRedirect(event, '/auth', 302)

  const { dateRange, searchQuery, page, status, clientsType }: any =
    getQuery(event)

  const searchQueryParam: any = searchQuery
    ? {
        $or: [
          { username: { $regex: searchQuery, $options: 'i' } },
          { orgName: { $regex: searchQuery, $options: 'i' } },
        ],
      }
    : {}

  let users = []
  if (status === 'all') {
    users = await getUsers.allUsers(page, searchQueryParam, dateRange, clientsType)
  } else if (status === 'active') {
    users = await getUsers.activeUsers(page, searchQueryParam, dateRange, clientsType)
  } else if (status === 'inactive') {
    users = await getUsers.inactiveUsers(page, searchQueryParam, dateRange, clientsType)
  } else {
    users = await getUsers.registeredUsers(page, searchQueryParam, dateRange, clientsType)
  }

  await ActionHistory.create({
    adminUser: user._id,
    actionId: 82,
    actionDescription: `Админ ${user.uuid} - ${user.username} получил список информации о клиентах, вкладка Клиенты`,
    date: new Date(),
  })

  return users
})
