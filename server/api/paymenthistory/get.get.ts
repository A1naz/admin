import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { paymenthistory } from '~~/server/lib/models/Paymenthistory'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session)
    return sendRedirect(event, '/auth', 302)
  const { skip, limit } = getQuery(event)
  const user = await User.findOne({ uuid: session.uuid })
  if (!user)
    return sendRedirect(event, '/auth', 302)
  const history = await paymenthistory.find({ user }).sort({ _id: -1 }).skip(skip as number).limit(limit as number)
  return history
})
