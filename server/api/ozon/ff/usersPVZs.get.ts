import { User } from '~/server/lib/models/User'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { getServerSession } from '#auth'
import { FFPVZ } from '~/server/lib/models/ozon/FFPVZS'

const usersPerPage = 25

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session) return sendRedirect(event, '/auth', 302)

  const { userId, date }: any = getQuery(event)

  const trueDate = new Date(new Date(date).setHours(0, 0, 0, 0))
  const minDate = new Date(new Date(date).setHours(trueDate.getHours() - 1))
  const maxDate = new Date(new Date(date).setHours(trueDate.getHours() + 1))

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

  const users = await User.find({ _id: { $in: userId } })

  const pvzs = await FFPVZ.find({ user: { $in: users } })

  const pvzsMap = new Map<string, any>()
  pvzs.forEach((pvz: any) => {
    pvz.pvzs.forEach((p: any) => {
      // console.log(p.date, new Date(minDate), new Date(maxDate), 'p: ', p);

      if (new Date(p.date) >= minDate && new Date(p.date) <= maxDate) {
        pvzsMap.set(p.id, p)
      }
    })
  })

  const format = Array.from(pvzsMap.values())

  return {
    status: 'ok',
    PVZs: format,
  }
})
