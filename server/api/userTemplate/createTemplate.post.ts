import { getServerSession } from '#auth'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { UserTemplate } from '~/server/lib/models/UserTemplate'
import { User } from '~/server/lib/models/User'
import { v4 as uuid } from 'uuid'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  const { users, title } = await readBody(event)

  if (!session) return sendRedirect(event, '/auth', 302)

  const userAdmin = await AdminUser.findOne({ uuid: session.uuid })
  if (!userAdmin) return sendRedirect(event, '/auth', 302)

  

  const newRequest = await UserTemplate.create({
    uuid: uuid(),
    user: userAdmin._id,
    userUuid: userAdmin.uuid,
    usersArray: users,

  })

  // await ActionHistory.create({
  //   adminUser: user._id,
  //   actionId: 92,
  //   actionDescription: `Админ ${user.uuid} - ${user.username} создал запрос возврата средств ${newRequest._id}`,
  //   date: new Date(),
  // })

  return {
    status: 'ok',
    message: 'Шаблон успешно создан',
  }
})
