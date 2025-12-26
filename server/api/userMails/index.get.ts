import { ConfirmPhone } from '~/server/lib/models/ConfirmPhone'
import { getServerSession } from '#auth'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { User } from '~/server/lib/models/User'
import { sanitizeSearchQuery } from '~/server/utils/sanitizeRegex'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  const { searchQuery, page, sortDate }: any = getQuery(event)

  if (!session) return sendRedirect(event, '/auth', 302)
  const user = await AdminUser.findOne({ uuid: session.uuid })

  if (!user || (!user.mainAdmin && !user.tabs.includes('рассылка клиентам')))
    return sendRedirect(event, '/auth', 302)

  const searchQueryParam: any = {
    emailLastSentDate: {
      $exists: true,
    },
  }

  if (searchQuery) {
    // ✅ FIX: Санитизация searchQuery для защиты от ReDoS
    const safeSearchQuery = sanitizeSearchQuery(searchQuery, 100)
    const safePhoneQuery = sanitizeSearchQuery(
      searchQuery.replace(/[^\d]/g, ''),
      20
    )

    searchQueryParam.$or = [
      { username: { $regex: safeSearchQuery, $options: 'i' } },
      { orgName: { $regex: safeSearchQuery, $options: 'i' } },
      {
        phoneNumber: {
          $regex: safePhoneQuery,
          $options: 'i',
        },
      },
    ]
  }

  const elPerPage = 50
  const usersCount = await User.countDocuments(searchQueryParam)

  const users = await User.find(searchQueryParam)
    .sort({ emailLastSentDate: sortDate })
    .skip(page > 1 ? (page - 1) * elPerPage : 0)
    .limit(elPerPage)
    .select(
      'username phoneNumber emailAutoSentCount emailLastSentDate emailFunnelClicksCount -_id'
    )
  // ✅ FIX: Удален console.log

  return { stats: users, count: usersCount }
})
