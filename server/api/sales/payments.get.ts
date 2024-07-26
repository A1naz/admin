import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { AdminUser } from '~/server/lib/models/AdminUser'
const limit = 50

export default eventHandler(async (event) => {
  // const session = (await getServerSession(event)) as any

  // if (!session) return sendRedirect(event, '/auth', 302)

  // const user = await AdminUser.findOne({ uuid: session.uuid })

  // if (!user || (!user.mainAdmin && !user.tabs.includes('тарифные планы')))
  //   return sendRedirect(event, '/auth', 302)

  const { dateRange, mp, searchQuery, page }: any = getQuery(event)



  return {}
})
