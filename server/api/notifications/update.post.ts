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

  const body = await readBody(event)

  await ActionHistory.create({
    adminUser: user._id,
    actionId: 182,
    actionDescription: `Админ ${user.uuid} - ${user.username} изменил ручное уведомление`,
    date: new Date(),
  })

  await Notification.findOneAndUpdate(
    {
      uuid: body.uuid,
    },
    {
      text: body.text,
      category: body.category,
      activationDate: body.activationDate,
      expireDate: new Date(body.activationDate).setDate(
        new Date(body.activationDate).getDate() + 30
      ),
    }
  )

  return {
    status: 'ok',
  }
})
