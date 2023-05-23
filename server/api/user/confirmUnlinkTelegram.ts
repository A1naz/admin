import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session)
    return sendRedirect(event, '/auth', 302)

  const user = await User.findOne({ uuid: session.uuid })
  if (!user)
    return sendRedirect(event, '/auth', 302)

  if (!user.email) {
    throw createError({
      statusCode: 400,
      message: 'Привяжите email, чтобы отвязать Telegram',
    })
  }
  
  await user.save()
  return {
    status: 'ok',
  }
})
