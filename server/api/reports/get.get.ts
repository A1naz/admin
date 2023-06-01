import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { Report } from '~~/server/lib/models/Report'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session)
    return sendRedirect(event, '/auth', 302)

  const user = await User.findOne({ uuid: session.uuid })
  if (!user)
    return sendRedirect(event, '/auth', 302)
  const history = await Report.find({ user })
  return history
})
