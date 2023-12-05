import { User } from '@/server/lib/models/User'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { getServerSession } from '#auth'
import { Buyout } from '@/server/lib/models/Buyout'
import { Delivery } from '~~/server/lib/models/Delivery'
import { ActionHistory } from '~/server/lib/models/actionHistory'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  const { userUuid, tariffs } = await readBody(event)
  if (!session) return sendRedirect(event, '/auth', 302)

  const user = await AdminUser.findOne({ uuid: session.uuid })
  if (!user || (!user.mainAdmin && !user.tabs.includes('запросы скриншотов')))
    return sendRedirect(event, '/auth', 302)

  const tariffsForComment = Object.values(tariffs).map(
    (item: any) => ' ' + item.value
  )

  if (userUuid !== 'all') {
    const foundUser = await User.findOne({ uuid: userUuid })
    if (!foundUser) {
      throw createError({
        message: 'Пользователь не найден',
        statusCode: 404,
      })
    }

    foundUser.tariff = tariffs
    await foundUser.save()

    await ActionHistory.create({
      adminUser: user._id,
      adminUserUuid: user.uuid,
      actionId: 92,
      actionDescription: `Тарифы пользователя ${foundUser.username} были изменены на значения ${tariffsForComment}`,
      date: new Date(),
      userUuid: foundUser.uuid,
    })
  } else {
    await User.updateMany({}, { $set: { tariff: tariffs } })

    await ActionHistory.create({
      adminUser: user._id,
      adminUserUuid: user.uuid,
      actionId: 93,
      actionDescription: `Тарифы всех пользователей были изменены на значения ${tariffsForComment}`,
      date: new Date(),
    })
  }

  return {
    status: 'ok',
  }
})
