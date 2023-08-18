import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { Report } from '~~/server/lib/models/Report'

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

  const { string, type } = getQuery(event)
  const user = await User.findOne({ uuid: session.uuid })
  if (!user)
    return sendRedirect(event, '/auth', 302)
  let history
  const format: historyItem[] = []
  if (type === 'uuid') {
    const uuid = string?.toString().replaceAll('#', '')
    history = await Report.find({ user }).populate({ path: 'buyout', match: { uuid } })
  }

  if (!history)
    return []
  for await (const item of history) {
    if (!item.buyout)
      continue
    format.push({
      date: item.date,
      card: item.card,
      screenshots: item.screenshots,
      buyout: {
        place: item.buyout.place,
        uuid: item.buyout.uuid,
        image: item.buyout.product.image,
      },
    })
  }

  return format
})
