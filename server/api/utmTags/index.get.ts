import { UTMTag } from '~/server/lib/models/UTMTag'
import { getServerSession } from '#auth'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { sanitizeSearchQuery } from '~/server/utils/sanitizeRegex'
import { paymenthistory } from '~/server/lib/models/Paymenthistory'
import { User } from '~/server/lib/models/User'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  const { search, page, sortDate }: any = getQuery(event)
  const elPerPage = 50

  if (!session) return sendRedirect(event, '/auth', 302)

  const user = await AdminUser.findOne({ uuid: session.uuid })

  if (!user || (!user.mainAdmin && !user.tabs.includes('utm метки')))
    return sendRedirect(event, '/auth', 302)

  const query: any = {}

  if (search && search.length > 0) {
    const safeSearch = sanitizeSearchQuery(search, 100)
    query.$or = [
      { name: { $regex: safeSearch, $options: 'i' } },
      { utmCode: { $regex: safeSearch, $options: 'i' } },
      { createdByUsername: { $regex: safeSearch, $options: 'i' } },
    ]
  }

  const count = await UTMTag.countDocuments(query)
  const tags = await UTMTag.find(query)
    .sort({ createdAt: sortDate || -1 })
    .skip((page - 1) * elPerPage)
    .limit(elPerPage)

  // Динамически считаем счетчики для каждой метки
  const tagsWithStats = await Promise.all(
    tags.map(async (tag) => {
      // 1. Считаем registrationsCount - количество пользователей с этим utmCode
      const registrationsCount = await User.countDocuments({
        utmCode: tag.utmCode,
      })

      // 2. Считаем paymentsCount - количество уникальных пользователей с этим utmCode,
      //    у которых есть хотя бы одна запись paymenthistory с type: 'deposit'
      
      // Находим всех пользователей с этим utmCode
      const usersWithUtm = await User.find(
        { utmCode: tag.utmCode },
        { _id: 1 }
      )
      
      const userIds = usersWithUtm.map((u) => u._id)

      // Находим уникальных пользователей, у которых есть депозиты
      const usersWithDeposits = await paymenthistory.distinct('user', {
        user: { $in: userIds },
        type: 'deposit',
      })

      const paymentsCount = usersWithDeposits.length

      return {
        ...tag.toObject(),
        registrationsCount,
        paymentsCount,
      }
    })
  )

  return { tags: tagsWithStats, count }
})

