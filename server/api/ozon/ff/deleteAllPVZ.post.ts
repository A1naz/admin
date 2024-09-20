import { User } from '~/server/lib/models/User'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { getServerSession } from '#auth'
import { FFPVZ } from '~/server/lib/models/ozon/FFPVZS'
import { ActionHistory } from '~/server/lib/models/actionHistory'

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

  const { userId, date } = await readBody(event)

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

  await ActionHistory.create({
    adminUser: userAdmin._id,
    actionId: 112,
    actionDescription: `Удаление всех пвз у пользователей за ${trueDate}`,
    usersUuid: users.map((user: any) => user.uuid),
    date: new Date(),
    mp: 'wildberries',
  })

  const userPVZS = await FFPVZ.find({ user: { $in: users } })
  for (const user of users) {
    if (!user.ffEnabled) {
      user.ffEnabled = true
      await user.save()
    }

    const userPVZ = userPVZS?.find(
      (pvz: any) => pvz.user.valueOf() === user._id.valueOf()
    )

    // console.log(userPVZ)

    if (userPVZ) {
      let deleteIndexes = []

      for (let i = userPVZ.pvzs.length - 1; i >= 0; i--) {
        const item = userPVZ.pvzs[i];
        if (new Date(item.date) <= maxDate && new Date(item.date) >= minDate) {
          userPVZ.pvzs.splice(i, 1);
        }
      }
      

      await userPVZ.save()
    }
  }

  return {
    status: 'ok',
  }
})
