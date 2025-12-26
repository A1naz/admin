import { User } from '@/server/lib/models/User'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { getServerSession } from '#auth'
import { ActionHistory } from '~/server/lib/models/actionHistory'
import { requireValidObjectId } from '~/server/utils/validateObjectId'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  const { userId }: any = getQuery(event)

  // NoSQL Injection Protection
  requireValidObjectId(userId, 'userId')

  if (!session) return sendRedirect(event, '/auth', 302)
  const user = await AdminUser.findOne({ uuid: session.uuid })
  if (!user || !user.tabs.includes('управление пользователями платформы'))
    return sendRedirect(event, '/auth', 302)

  const found = await User.findById(userId)
  if (!found) {
    return createError({
      statusCode: 400,
      message: 'Пользователь не найден',
    })
  }

  // IDOR Protection: Проверка прав доступа к пользователю
  if (!user.mainAdmin) {
    // Проверка что пользователь в списке разрешенных
    if (!user.isAllUsersAllowed && !user.allowedUsers.some((id: any) => id.equals(found._id))) {
      throw createError({
        statusCode: 403,
        message: 'Недостаточно прав доступа к этому пользователю',
      })
    }
    // Проверка что пользователь не в списке запрещенных
    if (user.restrictedUsers.some((id: any) => id.equals(found._id))) {
      throw createError({
        statusCode: 403,
        message: 'Доступ к этому пользователю ограничен',
      })
    }
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
