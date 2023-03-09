import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session) {
    return sendRedirect(event, '/auth', 302)
  }
  const user = await User.findOne({ uuid: session.uuid })
  if (!user) {
    return sendRedirect(event, '/auth', 302)
  }
  console.log(session)
  return {
    client: {
      email: user.email,
      userpic: user.userpic,
      username: user.username,
      uuid: user.uuid,
    },
    status: 'ok',
  }
})
