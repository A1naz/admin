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
  const {
    isAllUsersSelected,
    selectedUsers,
    title,
    description,
    activationDate,
    isImmediate,
  } = body

  await ActionHistory.create({
    adminUser: user._id,
    actionId: 182,
    actionDescription: `Админ ${user.uuid} - ${user.username} создал ручное уведомление`,
    date: new Date(),
  })

  await Notification.create({
    text: description,
    category: title,
    admin: user._id,
    uuid: uuid(),
    forAll: isAllUsersSelected,
    users: isAllUsersSelected
      ? []
      : selectedUsers.map((user: any) => new ObjectId(user._id)),
    isReaded: false,
    readUser: [],
    isRemoved: false,
    removedUser: [],
    date: new Date(Date.now()),
    activationDate: isImmediate ? new Date(Date.now()) : activationDate,
    expireDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
  })

  return {
    status: 'ok',
  }
})
