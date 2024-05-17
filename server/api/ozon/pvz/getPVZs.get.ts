import { AdminUser } from '~/server/lib/models/AdminUser'
import { User } from '~/server/lib/models/User'
import { Buyout } from '~~/server/lib/models/ozon/Buyout'
import { getServerSession } from '#auth'
const usersPerPage = 25
export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session) return sendRedirect(event, '/auth', 302)

  const { page, searchValue, sortDate, role, users }: any = getQuery(event)

  const userAdmin = await AdminUser.findOne({ uuid: session.uuid })
  if (!userAdmin) return sendRedirect(event, '/auth', 302)

  const foundBuyouts = await Buyout.find({
    point: { $regex: searchValue, $options: 'i' },
    user: { $in: users },
  }).limit(1000)

  if (!foundBuyouts) {
    return {
      PVZs: [],
      PVZsCount: 0,
      status: 'ok',
    }
  }

  const PVZsMap = new Map<string, any>()

  foundBuyouts.forEach((buyout, index) => {
    if (PVZsMap.has(buyout.point)) return
    PVZsMap.set(buyout.point, {
      address: buyout.point,
      uuid: buyout.point,
    })
  })

  const PVZs = Array.from(PVZsMap.values())

  return {
    PVZs,
    PVZsCount: PVZs.length,
    status: 'ok',
  }
})
