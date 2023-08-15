import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { Buyout } from '@/server/lib/models/Buyout'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session)
    return sendRedirect(event, '/auth', 302)

  const { string, type } = getQuery(event)
  const user = await User.findOne({ uuid: session.uuid })
  if (!user)
    return sendRedirect(event, '/auth', 302)

  const all = await Buyout.find({ user })
  let buyouts
  if (type === 'article') {
    buyouts = await Buyout.find({ user, article: string })
      .sort({ createdAt: -1 })
  }
  else if (type === 'uuid') {
    const uuid = string?.toString().replaceAll('#', '')
    buyouts = await Buyout.find({ user, uuid })
      .sort({ createdAt: -1 })
  }
  else if (type === 'name') {
    buyouts = await Buyout.find({ user, $text: { $search: string } })
      .sort({ createdAt: -1 })
  }
  else {
    buyouts = await Buyout.find({ user })
      .sort({ createdAt: -1 })
      .skip(0)
      .limit(50)
  }

  const format = buyouts.map((buyout) => {
    const place = all.findIndex(item => item.uuid === buyout.uuid)
    return {
      place: buyout.place ? buyout.place : place + 1,
      uuid: buyout.uuid,
      article: buyout.article,
      searchQuery: buyout.searchQuery,
      point: buyout.point,
      dateStart: buyout.dateStart,
      dateEnd: buyout.dateEnd,
      sizeparam: buyout.sizeparam,
      quantity: buyout.quantity,
      gender: buyout.gender,
      status: buyout.status,
      completed: buyout.completed,
      rules: buyout.rules,
      createdAt: buyout.createdAt,
      product: buyout.product,
    }
  })
  return format
})
