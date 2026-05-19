import { LoginAttempt } from '~/server/lib/models/LoginAttempt'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { getServerSession } from '#auth'
import { sanitizeSearchQuery } from '~/server/utils/sanitizeRegex'

const elPerPage = 50

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)

  const adminUser = await AdminUser.findOne({ uuid: session.uuid })
  if (!adminUser || (!adminUser.mainAdmin && !adminUser.tabs.includes('попытки входа')))
    return sendRedirect(event, '/auth', 302)

  const { page = 1, search, sortDate }: any = getQuery(event)

  const baseCondition = {
    $or: [
      { identifier: { $exists: true, $ne: '' } },
      { phoneNumber: { $exists: true, $ne: '' } },
    ],
  }

  let query: any = baseCondition

  if (search && search.length > 0) {
    const safeSearch = sanitizeSearchQuery(search, 100)
    query = {
      $and: [
        baseCondition,
        {
          $or: [
            { identifier: { $regex: safeSearch, $options: 'i' } },
            { phoneNumber: { $regex: safeSearch, $options: 'i' } },
          ],
        },
      ],
    }
  }

  const count = await LoginAttempt.countDocuments(query)
  const attempts = await LoginAttempt.find(query, { ip: 0 })
    .sort({ createdAt: +sortDate === 1 ? 1 : -1 })
    .skip((+page - 1) * elPerPage)
    .limit(elPerPage)

  const normalizedAttempts = attempts.map((a: any) => {
    const obj = a.toObject()
    if (!obj.identifier && obj.phoneNumber) {
      obj.identifier = obj.phoneNumber
    }
    return obj
  })

  return { attempts: normalizedAttempts, count }
})
