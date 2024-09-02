import { AdminUser } from '~/server/lib/models/AdminUser'
import { User } from '~/server/lib/models/User'
import { ActionHistory } from '@/server/lib/models/actionHistory'
import { getServerSession } from '#auth'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)

  const admin = await AdminUser.findOne({ uuid: session.uuid })
  if (!admin || (!admin.tabs.includes('клиенты') && !admin.mainAdmin))
    return sendRedirect(event, '/auth', 302)

  const { uuid }: any = getQuery(event)
  console.log(uuid)

  const user = await User.findOne({ uuid })

  if (!user) {
    throw createError({
      statusCode: 400,
      message: 'Пользователь не найден',
    })
  }

  user.isDocSigned = true
  await user.save()

  await ActionHistory.create({
    adminUser: user._id,
    adminUserUuid: user.uuid,
    actionDescription: `Пользователь ${admin.uuid} - ${admin.username} подписал договор пользователя ${user.uuid} - ${user.username}`,
    userUuid: user.uuid,
    actionId: 142,
  })

  return { status: 'ok' }
})
