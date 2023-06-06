import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { Report } from '~~/server/lib/models/Report'
import { Buyout } from '~/server/lib/models/Buyout'

interface buyoutInfo {
  place: number
  uuid: string
  image: string
}
interface historyItem {
  date: Date
  card: String
  screenshots: string[]
  buyout: buyoutInfo

}

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session)
    return sendRedirect(event, '/auth', 302)

  const user = await User.findOne({ uuid: session.uuid })
  if (!user)
    return sendRedirect(event, '/auth', 302)
  const format: historyItem[] = []

  const history = await Report.find({ user })
  for await (const item of history) {
    const buyout = await Buyout.findOne({ _id: item.buyout })
    if (!buyout)
      return
    format.push({
      date: item.date,
      card: item.card,
      screenshots: item.screenshots,
      buyout: {
        place: buyout.place,
        uuid: buyout.uuid,
        image: buyout.product.image,
      },
    })
  }

  return format
})
