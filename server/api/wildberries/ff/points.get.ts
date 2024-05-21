import { User } from '~/server/lib/models/User'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { getServerSession } from '#auth'
import { FFPVZ } from '~/server/lib/models/wildberries/FFPVZS'
import getPoints from '~/server/utils/wildberries/getPoints'

const usersPerPage = 25

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session) return sendRedirect(event, '/auth', 302)

  const userAdmin = await AdminUser.findOne({ uuid: session.uuid })
  if (
    !userAdmin ||
    (!userAdmin.mainAdmin && !userAdmin.tabs.includes('фулфилмент'))
  )
    return sendRedirect(event, '/auth', 302)

  const { searchValue }: any = getQuery(event)

  const points = (await getPoints()).points

  const searchQuery = searchValue.toLowerCase()
  const result = []
  for (let i = 0; i < points.length; i++) {
    if (points[i].a.toLowerCase().includes(searchQuery)) {
      result.push({
        id: points[i].id,
        address: points[i].a,
        lt: points[i].lt,
        lg: points[i].lg,
      })
      if (result.length === 50) {
        break
      }
    }
  }

  return {
    status: 'ok',
    PVZs: result,
  }
})
