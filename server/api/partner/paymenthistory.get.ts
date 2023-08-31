import { PartnerPaymentHistory } from '~/server/lib/models/PartnerPaymentHistory'
import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session)
    return sendRedirect(event, '/auth', 302)
  const user = await User.findOne({ uuid: session.uuid })
  if (!user)
    return sendRedirect(event, '/auth', 302)
  const history = await PartnerPaymentHistory.find({ user }).sort({ _id: -1 }).limit(10)
  if (!history)
    return []
  return history
})
