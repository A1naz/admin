import { LoginAttempt } from '~/server/lib/models/LoginAttempt'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { getServerSession } from '#auth'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const adminUser = await AdminUser.findOne({ uuid: session.uuid })
  if (!adminUser || (!adminUser.mainAdmin && !adminUser.tabs.includes('попытки входа'))) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const { identifier } = await readBody(event)

  if (!identifier) {
    throw createError({ statusCode: 400, statusMessage: 'Идентификатор обязателен' })
  }

  // Находим все записи с этим identifier, чтобы собрать связанные IP
  const relatedRecords = await LoginAttempt.find(
    { identifier },
    { ip: 1 }
  )

  const relatedIPs = [...new Set(relatedRecords.map((r) => r.ip).filter(Boolean))]

  // Удаляем все записи с этим identifier
  await LoginAttempt.deleteMany({ identifier })

  // Удаляем все записи с этими IP (даже без identifier)
  if (relatedIPs.length > 0) {
    await LoginAttempt.deleteMany({ ip: { $in: relatedIPs } })
  }

  return { success: true }
})
