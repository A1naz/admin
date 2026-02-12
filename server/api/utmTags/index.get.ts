import { UTMTag } from '~/server/lib/models/UTMTag'
import { getServerSession } from '#auth'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { sanitizeSearchQuery } from '~/server/utils/sanitizeRegex'
import { paymenthistory } from '~/server/lib/models/Paymenthistory'
import { User } from '~/server/lib/models/User'
import { UTMClick } from '~/server/lib/models/UTMClick'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  const { search, page, sortDate, dateRange, categoryId, platformId }: any = getQuery(event)
  const elPerPage = 50

  if (!session) return sendRedirect(event, '/auth', 302)

  const user = await AdminUser.findOne({ uuid: session.uuid })

  if (!user || (!user.mainAdmin && !user.tabs.includes('utm метки')))
    return sendRedirect(event, '/auth', 302)

  // Парсим диапазон дат если он есть
  let startDate: Date | null = null
  let endDate: Date | null = null
  
  if (dateRange && Array.isArray(dateRange) && dateRange.length === 2) {
    startDate = new Date(JSON.parse(dateRange[0]))
    endDate = new Date(JSON.parse(dateRange[1]))
  }

  const query: any = {}

  if (search && search.length > 0) {
    const safeSearch = sanitizeSearchQuery(search, 100)
    query.$or = [
      { name: { $regex: safeSearch, $options: 'i' } },
      { utmCode: { $regex: safeSearch, $options: 'i' } },
      { createdByUsername: { $regex: safeSearch, $options: 'i' } },
    ]
  }

  // Фильтр по категории
  if (categoryId && categoryId !== 'null') {
    query.category = categoryId
  }

  // Фильтр по площадке
  if (platformId && platformId !== 'null') {
    query.platform = platformId
  }

  const count = await UTMTag.countDocuments(query)
  const tags = await UTMTag.find(query)
    .sort({ createdAt: sortDate || -1 })
    .skip((page - 1) * elPerPage)
    .limit(elPerPage)

  // Динамически считаем счетчики для каждой метки
  const tagsWithStats = await Promise.all(
    tags.map(async (tag) => {
      // Если выбран период дат
      if (startDate && endDate) {
        // 1. Переходы на лендинг - считаем записи UTMClick с type: 'landing'
        const transitionToLanding = await UTMClick.countDocuments({
          utmCode: tag.utmCode,
          type: 'landing',
          date: {
            $gte: startDate,
            $lte: endDate,
          },
        })

        // 2. Переходы на портал - считаем записи UTMClick с type: 'portal'
        const transitionToPortal = await UTMClick.countDocuments({
          utmCode: tag.utmCode,
          type: 'portal',
          date: {
            $gte: startDate,
            $lte: endDate,
          },
        })

        // 3. Регистрации - считаем User с registrationDate в периоде
        const registrationsCount = await User.countDocuments({
          utmCode: tag.utmCode,
          registrationDate: {
            $gte: startDate,
            $lte: endDate,
          },
        })

        // 4. Пополнения - уникальные User с dataoperation в периоде
        const usersWithUtm = await User.find(
          { utmCode: tag.utmCode },
          { _id: 1 }
        )
        
        const userIds = usersWithUtm.map((u) => u._id)

        const usersWithDeposits = await paymenthistory.distinct('user', {
          user: { $in: userIds },
          type: 'deposit',
          dataoperation: {
            $gte: startDate,
            $lte: endDate,
          },
        })

        const paymentsCount = usersWithDeposits.length

        return {
          ...tag.toObject(),
          transitionToLanding,
          transitionToPortal,
          registrationsCount,
          paymentsCount,
        }
      } else {
        // Без фильтра по датам (общая статистика за все время)
        
        // 1. Переходы на лендинг
        const transitionToLanding = await UTMClick.countDocuments({
          utmCode: tag.utmCode,
          type: 'landing',
        })

        // 2. Переходы на портал
        const transitionToPortal = await UTMClick.countDocuments({
          utmCode: tag.utmCode,
          type: 'portal',
        })

        // 3. Регистрации - количество пользователей с этим utmCode
        const registrationsCount = await User.countDocuments({
          utmCode: tag.utmCode,
        })

        // 4. Пополнения - уникальные пользователи с депозитами
        const usersWithUtm = await User.find(
          { utmCode: tag.utmCode },
          { _id: 1 }
        )
        
        const userIds = usersWithUtm.map((u) => u._id)

        const usersWithDeposits = await paymenthistory.distinct('user', {
          user: { $in: userIds },
          type: 'deposit',
        })

        const paymentsCount = usersWithDeposits.length

        return {
          ...tag.toObject(),
          transitionToLanding,
          transitionToPortal,
          registrationsCount,
          paymentsCount,
        }
      }
    })
  )

  return { tags: tagsWithStats, count }
})

