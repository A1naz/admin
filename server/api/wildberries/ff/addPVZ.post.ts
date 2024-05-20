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
    await FFPVZ.create({ user, pvzs: [pvz] })
  }

  if (userpvzs) {
    let isIncludes = false
    userpvzs.pvzs.forEach((item) => {
      if (item.id === pvz.id && item.address === pvz.address) {
        isIncludes = true
      }
    })
    if (!isIncludes) {
      userpvzs.pvzs.push(pvz)
      await userpvzs.save()
    } else {
      return {
        status: 'error',
        message: 'Такой ПВЗ уже добавлен этому пользователю',
      }
    }
  }

  console.log(userpvzs)

  return {
    status: 'ok',
  }
})
