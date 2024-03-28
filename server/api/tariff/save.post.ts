import { User } from '@/server/lib/models/User'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { getServerSession } from '#auth'
import { Buyout } from '@/server/lib/models/Buyout'
import { Delivery } from '~~/server/lib/models/Delivery'
import { ActionHistory } from '~/server/lib/models/actionHistory'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  const { userUuid, tariffs }: any = await readBody(event)
  if (!session) return sendRedirect(event, '/auth', 302)

  const user = await AdminUser.findOne({ uuid: session.uuid })
  if (!user || (!user.mainAdmin && !user.tabs.includes('запросы скриншотов')))
    return sendRedirect(event, '/auth', 302)

  const foundUser: any = await User.findOne({
    uuid: userUuid,
  })

  if (!foundUser) {
    throw createError({
      statusCode: 400,
      message: 'Пользователь не найден',
    })
  }

  foundUser.MPTariffs = tariffs
  await foundUser.save()

  await ActionHistory.create({
    adminUser: user._id,
    adminUserUuid: user.uuid,
    actionId: 92,
    actionDescription: `Тарифы пользователя ${foundUser.username} были изменены на значения ${tariffs}`,
    date: new Date(),
    userUuid: foundUser.uuid,
  })

  return {
    status: 'ok',
  }
})
