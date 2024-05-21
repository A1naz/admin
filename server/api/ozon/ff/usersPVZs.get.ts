import { User } from '~/server/lib/models/User'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { getServerSession } from '#auth'
import { FFPVZ } from '~/server/lib/models/ozon/FFPVZS'

const usersPerPage = 25

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session) return sendRedirect(event, '/auth', 302)

  const { userId }: any = getQuery(event)

  if (!userId) {
    return {
      status: 'error',
      PVZs: [],
    }
  }

  const userAdmin = await AdminUser.findOne({ uuid: session.uuid })
  if (
    !userAdmin ||
    (!userAdmin.mainAdmin && !userAdmin.tabs.includes('фулфилмент'))
  )
    return sendRedirect(event, '/auth', 302)

  const pvzs = await FFPVZ.findOne({ user: userId })

  if (!pvzs) {
    return {
      status: 'error',
      PVZs: [],
    }
  }

  return {
    status: 'ok',
    PVZs: pvzs.pvzs,
  }
})
