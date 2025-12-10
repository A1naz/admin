import { ConfirmPhone } from '~/server/lib/models/ConfirmPhone'
import { getServerSession } from '#auth'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { User } from '~/server/lib/models/User'

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
    searchQueryParam.$or = [
      { username: { $regex: searchQuery.replace('	', ''), $options: 'i' } },
      { orgName: { $regex: searchQuery.replace('	', ''), $options: 'i' } },
      {
        phoneNumber: {
          $regex: searchQuery
            .replace('+', '')
            .replace(/[()\-\s]/g, '')
            .replace('	', ''),
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
  console.log(users)

  return { stats: users, count: usersCount }
})
