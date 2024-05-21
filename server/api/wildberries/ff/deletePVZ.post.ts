import { User } from '~/server/lib/models/User'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { getServerSession } from '#auth'
import { FFPVZ } from '~/server/lib/models/wildberries/FFPVZS'

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

  const { userId, pvz } = await readBody(event)
  console.log(pvz, userId)

  const user = await User.findById(userId)
  if (!user) {
    throw createError({
      message: 'Пользователь не найден',
      statusCode: 404,
    })
  }

  const userpvzs = await FFPVZ.findOne({ user })
  if (!userpvzs) {
    throw createError({
      message: 'ПВЗ не найден',
      statusCode: 404,
    })
  }

  if (userpvzs) {
    userpvzs.pvzs = userpvzs.pvzs.filter((p: any) => p.id !== pvz.id)
    await userpvzs.save()
  }

  return {
    status: 'ok',
  }
})
