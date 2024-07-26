import { TariffPayment } from '@/server/lib/models/TariffPayment'
import { getServerSession } from '#auth'
import { AdminUser } from '@/server/lib/models/AdminUser'
import { ActionHistory } from '@/server/lib/models/actionHistory'

export default eventHandler(async (event) => {
  const { uuid, status }: any = await readBody(event)

  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)

  const adminUser = await AdminUser.findOne({ uuid: session.uuid })
  if (
    !adminUser ||
    (!adminUser.mainAdmin && !adminUser.tabs.includes('тарифные планы'))
  )
    return sendRedirect(event, '/auth', 302)

  const foundTariff = await TariffPayment.findOne({ uuid })
  if (!foundTariff) {
    throw createError({
      statusCode: 400,
      message: 'Тариф не найден',
    })
  }

  await ActionHistory.create({
    adminUser: adminUser._id,
    actionId: 133,
    actionDescription: `Админ ${adminUser.uuid} - ${adminUser.username} отредактировал тариф ${foundTariff._id} на статус ${status}`,
    date: new Date(),
  })

  console.log(status);
  
  foundTariff.status = status
  await foundTariff.save()

  return {
    status: 'ok',
  }
})
