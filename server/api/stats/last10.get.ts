import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { paymenthistory } from '~/server/lib/models/Paymenthistory'
import { Buyout } from '~/server/lib/models/Buyout'


export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session) return sendRedirect(event, '/auth', 302)
  const user = await User.findOne({ uuid: session.uuid })
  if (!user) return sendRedirect(event, '/auth', 302)

  const buyouts = await Buyout.find({ user }).sort({ createdAt: -1 }).limit(10)
  const lastElements: any[] = []
  buyouts.forEach((item: any) => {
    lastElements.push({
      article: item.article,
      searchQuery: item.searchQuery,
      pvz: item.point,
    })
  })

  return lastElements
})
