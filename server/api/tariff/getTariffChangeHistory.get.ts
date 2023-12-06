import { User } from '@/server/lib/models/User'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { getServerSession } from '#auth'
import { ActionHistory } from '~/server/lib/models/actionHistory'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  const { page } = getQuery(event)

  if (!session) return sendRedirect(event, '/auth', 302)
  const user = await AdminUser.findOne({ uuid: session.uuid })
  if (!user) return sendRedirect(event, '/auth', 302)

  const tatiffsChangeHistory = await ActionHistory.find({
    actionId: { $in: [92, 93] },
  })
    .skip((Number(page) - 1) * 50)
    .limit(50)
    .sort({ date: -1 })

  await ActionHistory.create({
    adminUser: user._id,
    actionId: 91,
    actionDescription: `Получение истории изменения тарифов`,
    date: new Date(),
  })

  const userUuids = new Map()
  tatiffsChangeHistory.forEach((item: any) => {
    if (item.userUuid && !userUuids.has(item.userUuid))
      userUuids.set(item.userUuid, 1)
  })

  const users = await User.find({
    uuid: { $in: Array.from(userUuids.keys()) },
  })

  const format = tatiffsChangeHistory.map((item: any) => {
    const username = users.find((user: any) => {
      if (user.uuid === item.userUuid) {
        return user.username
      }
    })

    return {
      adminUserUuid: item.adminUserUuid,
      username: username ? username.username : '',
      actionDescription: item.actionDescription,
      date: item.date,
      userUuid: item.userUuid,
    }
  })

  return format
})
