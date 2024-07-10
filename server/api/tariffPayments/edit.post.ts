import { TariffPlan } from '@/server/lib/models/TariffPlan'
import { getServerSession } from '#auth'
import { AdminUser } from '@/server/lib/models/AdminUser'
import { User } from '@/server/lib/models/User'
import { ActionHistory } from '@/server/lib/models/actionHistory'
import { v4 as uuid } from 'uuid'

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

  const foundTariff = await TariffPlan.findOne({ uuid })
  if (!foundTariff) {
    throw createError({
      statusCode: 400,
      message: 'Тариф не найден',
    })
  }
  foundTariff.status = status
  await foundTariff.save()

  return {
    status: 'ok',
  }
})
