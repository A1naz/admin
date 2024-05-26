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

  const { userId, pvz, date } = await readBody(event)
  
  const trueDate = new Date(new Date(date).setHours(0, 0, 0, 0))
  const minDate = new Date(new Date(date).setHours(trueDate.getHours() - 6))
  const maxDate = new Date(new Date(date).setHours(trueDate.getHours() + 6))

  const users = await User.find({ _id: { $in: userId } })

  if (!users || !users.length) {
    throw createError({
      message: 'Пользователи не найдены',
      statusCode: 404,
    })
  }

  const userPVZS = await FFPVZ.find({ user: { $in: users } })
  for (const user of users) {
    if (!user.ffEnabled) {
      user.ffEnabled = true
      await user.save()
    }

    const userPVZ = userPVZS?.find(
      (pvz: any) => pvz.user.valueOf() === user._id.valueOf()
    )

    if (!userPVZ) {
      await FFPVZ.create({
        user,
        pvzs: [{ ...pvz, date: trueDate }],
      })
    } else if (userPVZ) {
      let isIncludes = false
      userPVZ.pvzs.forEach((item) => {
        if (
          item.id === pvz.id &&
          new Date(item.date) <= maxDate &&
          new Date(item.date) >= minDate
        ) {
          console.log('saasdasd' + new Date(item.date))

          isIncludes = true
        }
      })
      if (!isIncludes) {
        userPVZ.pvzs.push({
          ...pvz,
          date: trueDate,
        })
        await userPVZ.save()
      }

    }
  }

  return {
    status: 'ok',
  }
})
