import { TariffPlan } from '@/server/lib/models/TariffPlan'
import { getServerSession } from '#auth'
import { AdminUser } from '@/server/lib/models/AdminUser'
import { User } from '@/server/lib/models/User'
import { ActionHistory } from '@/server/lib/models/actionHistory'
export default eventHandler(async (event) => {
  const {
    mp,
    tariff,
    type,
    timeLimit,
    activationDate,
    paymentDate,
    userUuid,
    screenshot,
  }: any = await readBody(event)

  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)

  const adminUser = await AdminUser.findOne({ uuid: session.uuid })
  if (
    !adminUser ||
    (!adminUser.mainAdmin && !adminUser.tabs.includes('тарифные планы'))
  )
    return sendRedirect(event, '/auth', 302)

  const user = await User.findOne({ uuid: userUuid })
  if (!user) {
    throw createError({
      statusCode: 400,
      message: 'Пользователь не найден',
    })
  }

  const currentDate = new Date()
  currentDate.setHours(12, 0, 0, 0)

  const dateActivation = new Date(activationDate)
  const dateEnd = new Date(activationDate)
  dateEnd.setMonth(dateActivation.getMonth() + Number(timeLimit))

  await ActionHistory.create({
    adminUser: adminUser._id,
    adminUserUuid: adminUser.uuid,
    userUuid: user.uuid,
    actionId: 122,
    actionDescription: `Админ ${adminUser.uuid} - ${adminUser.username} создал тарифный план`,
    date: new Date(),
  })

  await TariffPlan.create({
    adminUser: adminUser._id,
    user: user._id,
    mp,
    tariff,
    type,
    timeLimitMonths: timeLimit,
    activationDate: dateActivation,
    endDate: dateEnd,
    paymentDate,
    screenshot,
    createdAt: new Date(Date.now()),
  })

  return {
    status: 'ok',
  }
})
