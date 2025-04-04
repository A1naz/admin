import { getServerSession } from '#auth'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { ActionHistory } from '~/server/lib/models/actionHistory'
import { NotificationTemplate } from '~/server/lib/models/NotificationTemplate'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session) return sendRedirect(event, '/auth', 302)

  const user = await AdminUser.findOne({ uuid: session.uuid })

  if (!user || (!user.mainAdmin && !user.tabs.includes('ручные уведомления')))
    return sendRedirect(event, '/auth', 302)

  const { uuid }: any = getQuery(event)

  await ActionHistory.create({
    adminUser: user._id,
    actionId: 192,
    actionDescription: `Админ ${user.uuid} - ${user.username} удалил шаблон ручного уведомления`,
    date: new Date(),
  })

  await NotificationTemplate.findOneAndDelete({
    uuid,
  })

  return {
    status: 'ok',
  }
})
