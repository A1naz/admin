import { User } from '@/server/lib/models/User'
import { ActionHistory } from '~/server/lib/models/actionHistory'
import { getServerSession } from '#auth'
import { AdminUser } from '~/server/lib/models/AdminUser'
import getBuyouts from '~/server/lib/helpers/sutochno/getBuyouts'
import getDeliveries from '~/server/lib/helpers/sutochno/getDeliveries'
import getReviews from '~/server/lib/helpers/sutochno/getReviews'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  const { userId, status, item, page, serviceId }: any = getQuery(event)

  if (!session) return sendRedirect(event, '/auth', 302)
  const user = await AdminUser.findOne({ uuid: session.uuid })
  if (!user || !user.tabs.includes('управление пользователями платформы'))
    return sendRedirect(event, '/auth', 302)

  const foundUser = await User.findById(userId)

  if (!foundUser) {
    throw createError({
      message: 'Пользователь не найден',
      statusCode: 404,
    })
  }

  if (!user.isAllUsersAllowed && !user.allowedUsers.includes(foundUser._id)) {
    await ActionHistory.create({
      adminUser: user._id,
      actionId: 401,
      actionDescription: `Попытка получения информации о ${item}, пользователя uuid - ${userId}, недостаточно прав`,
      userUuid: foundUser.uuid,
      date: new Date(),
    })
    return sendRedirect(event, '/auth', 302)
  }

  await ActionHistory.create({
    adminUser: user._id,
    actionId: 91,
    actionDescription: `Получение информации о ${item}, ${
      status ? 'status - ' + status : ''
    }, пользователя uuid - ${userId}`,
    userUuid: foundUser.uuid,
    date: new Date(),
  })

  if (item == 'buyouts') {
    const { info, count } = await getBuyouts(userId, status, page, serviceId)
    return { info, count }
  }
  if (item == 'deliveries') {
    const { info, count } = await getDeliveries(userId, status, page, serviceId)
    return { info, count }
  }
  if (item == 'reviews') {
    const { info, count } = await getReviews(userId, status, page, serviceId)
    return { info, count }
  }

  return { info: [], count: 0 }
})
