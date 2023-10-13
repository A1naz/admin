import { User } from '@/server/lib/models/User'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { getServerSession } from '#auth'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  const { userId }: any = getQuery(event)

  if (!session) return sendRedirect(event, '/auth', 302)
  const user = await AdminUser.findOne({ uuid: session.uuid })
  if (!user || !user.roles.includes('admin'))
    return sendRedirect(event, '/auth', 302)

    console.log(userId);
    
  const found = await User.findById(userId)
  if (!found) {
    return createError({
      statusCode: 400,
      message: 'Пользователь не найден',
    })
  }
  found.isBanned ? (found.isBanned = false) : (found.isBanned = true)

  await found.save()
  return {
    status: 'ok',
  }
})
