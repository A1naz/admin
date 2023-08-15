import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { paymenthistory } from '~~/server/lib/models/Paymenthistory'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session)
    return sendRedirect(event, '/auth', 302)
  const { type, string } = getQuery(event)
  const user = await User.findOne({ uuid: session.uuid })
  if (!user)
    return sendRedirect(event, '/auth', 302)

  let history = []
  if (type === 'uuid') {
    const uuid = string?.toString().replaceAll('#', '')
    history = await paymenthistory.find({ user, $text: { $search: string } }).sort({ _id: -1 })
  }
  else { history = await paymenthistory.find({ user }).sort({ _id: -1 }) }

  return history
})
