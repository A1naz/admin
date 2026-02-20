import { AdminUser } from '~/server/lib/models/AdminUser'
import { User } from '~/server/lib/models/User'
import { Buyout } from '~~/server/lib/models/zy/Buyout'
import { getServerSession } from '#auth'
import { sanitizeSearchQuery } from '~/server/utils/sanitizeRegex'

const usersPerPage = 25
export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session) return sendRedirect(event, '/auth', 302)

  const { page, searchValue, sortDate, role, users }: any = getQuery(event)

  const userAdmin = await AdminUser.findOne({ uuid: session.uuid })
  if (!userAdmin) return sendRedirect(event, '/auth', 302)

  // ✅ FIX: Санитизация searchValue для защиты от ReDoS
  const safeSearchValue = sanitizeSearchQuery(searchValue || '', 200)

  const foundBuyouts = await Buyout.find({
    point: { $regex: safeSearchValue, $options: 'i' },
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
