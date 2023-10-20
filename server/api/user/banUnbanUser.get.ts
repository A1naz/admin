import { User } from '@/server/lib/models/User'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { getServerSession } from '#auth'
import { ActionHistory } from '~/server/lib/models/actionHistory'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  const { userId }: any = getQuery(event)

  if (!session) return sendRedirect(event, '/auth', 302)
  const user = await AdminUser.findOne({ uuid: session.uuid })
  if (!user || !user.roles.includes('manager'))
    return sendRedirect(event, '/auth', 302)

  const found = await User.findById(userId)
  if (!found) {
    return createError({
      statusCode: 400,
      message: 'Пользователь не найден',
    })
  }
  found.isBanned ? (found.isBanned = false) : (found.isBanned = true)

  let description = ''

  await ActionHistory.create({
    adminUser: user._id,
    actionId: 91,
    actionDescription: `Пользователь ${found.uuid} - ${found.username} ${
      found.isBanned ? 'забанен' : 'разбанен'
    } админом ${user.uuid}`,
    userUuid: found.uuid,
    date: new Date(),
  })

  await found.save()
  return {
    status: 'ok',
  }
})
