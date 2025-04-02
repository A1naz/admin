import { getServerSession } from '#auth'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { ActionHistory } from '~/server/lib/models/actionHistory'
import { Notification } from '~/server/lib/models/Notification'
import { ObjectId } from 'mongodb'
import { v4 as uuid } from 'uuid'

const limit = 50

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session) return sendRedirect(event, '/auth', 302)

  const user = await AdminUser.findOne({ uuid: session.uuid })

  if (!user || (!user.mainAdmin && !user.tabs.includes('ручные уведомления')))
    return sendRedirect(event, '/auth', 302)

  const { page = 1 }: any = getQuery(event)

  const notifications = await Notification.find({})
    .sort({ _id: -1 })
    .skip((page - 1) * limit)
    .limit(limit)

  if (!notifications) return []
  return notifications
})
