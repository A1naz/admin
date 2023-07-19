import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { Buyoutlog } from '@/server/lib/models/Buyoutlog'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session)
    return sendRedirect(event, '/auth', 302)

  const { uuid } = getQuery(event)
  const user = await User.findOne({ uuid: session.uuid })
  if (!user)
    return sendRedirect(event, '/auth', 302)

  const all = await Buyoutlog.find({ buyoutuuid: uuid }).sort({ _id: -1 })

  return all
})
