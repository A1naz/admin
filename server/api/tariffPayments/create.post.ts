import { TariffPayment } from '~/server/lib/models/TariffPayment'
import { getServerSession } from '#auth'
import { AdminUser } from '@/server/lib/models/AdminUser'
import { User } from '@/server/lib/models/User'
import { ActionHistory } from '@/server/lib/models/actionHistory'
import { v4 as uuid } from 'uuid'

export default eventHandler(async (event) => {
  const { mp, tariff, type, userUuid, price, months }: any = await readBody(
    event
  )

  // const session = (await getServerSession(event)) as any
  // if (!session) return sendRedirect(event, '/auth', 302)

  // const adminUser = await AdminUser.findOne({ uuid: session.uuid })
  // if (
  //   !adminUser ||
  //   (!adminUser.mainAdmin && !adminUser.tabs.includes('тарифные планы'))
  // )
  //   return sendRedirect(event, '/auth', 302)

  const user = await User.findOne({ uuid: userUuid })
  if (!user) {
    throw createError({
      statusCode: 400,
      message: 'Пользователь не найден',
    })
  }

  const currentDate = new Date()
  currentDate.setHours(12, 0, 0, 0)

  await TariffPayment.create({
    user: user._id,
    uuid: uuid(),
    mp,
    price,
    tariff,
    type,
    months,
    login: user.username,
    createdAt: currentDate,
    status: 'created',
  })

  return {
    status: 'ok',
  }
})
