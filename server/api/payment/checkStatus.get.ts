import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { Payment } from '~~/server/lib/models/Payment'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session)
    return sendRedirect(event, '/auth', 302)

  const user = await User.findOne({ uuid: session.uuid })
  if (!user)
    return sendRedirect(event, '/auth', 302)

  const payment = await Payment.findOne({ user }).sort({ _id: -1 })
  if (!payment)
    return { status: 'error', message: 'Payment not found' }

  const data = {
    status: payment.status,
  }

  return data
})
