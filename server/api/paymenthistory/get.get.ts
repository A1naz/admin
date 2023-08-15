import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { paymenthistory } from '~~/server/lib/models/Paymenthistory'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session)
    return sendRedirect(event, '/auth', 302)
  const { skip, limit, type, dateFilter } = getQuery(event)
  const user = await User.findOne({ uuid: session.uuid })
  if (!user)
    return sendRedirect(event, '/auth', 302)

  let history = []
  if (!type || type === 'all')
    history = await paymenthistory.find({ user }).sort({ _id: -1 }).skip(skip as number).limit(limit as number)
  else
    history = await paymenthistory.find({ user, type }).sort({ _id: -1 }).skip(skip as number).limit(limit as number)
  const today = new Date(Date.now())
  today.setHours(0, 0, 0, 0)
  switch (dateFilter) {
    case 'today':
      history = history.filter(item => new Date(item.dataoperation as Date) > today)
      break
    case '3days':
      history = history.filter(item => new Date(item.dataoperation as Date) > new Date(Date.now() - 1000 * 60 * 60 * 24 * 3))
      break
    case '7days':
      history = history.filter(item => new Date(item.dataoperation as Date) > new Date(Date.now() - 1000 * 60 * 60 * 24 * 7))
      break
  }
  return history
})
