import { User } from '~/server/lib/models/User'
import { getServerSession } from '#auth'
import { AdminUser } from '~/server/lib/models/AdminUser'
// phoneConfirmed сохраняется через $set напрямую в MongoDB, т.к. поле не объявлено в типах схемы

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const adminUser = await AdminUser.findOne({ uuid: session.uuid })
  if (!adminUser || (!adminUser.mainAdmin && !adminUser.tabs.includes('клиенты'))) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const { uuid } = await readBody(event)

  if (!uuid) {
    throw createError({ statusCode: 400, statusMessage: 'UUID обязателен' })
  }

  const result = await User.updateOne({ uuid }, { $set: { phoneConfirmed: true } })
  if (result.matchedCount === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Пользователь не найден' })
  }

  return { success: true }
})
