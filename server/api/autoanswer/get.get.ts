import { getServerSession } from '#auth'
import { User } from '~~/server/lib/models/User'
import { Autoanswer } from '~~/server/lib/models/Autoanswer'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  const dublicateItems = (arr: any, numberOfRepetitions: number) =>
    arr.flatMap(i => Array.from({ length: numberOfRepetitions }).fill(i))

  if (!session)
    return sendRedirect(event, '/auth', 302)

  const user = await User.findOne({ uuid: session.uuid })
  if (!user)
    return sendRedirect(event, '/auth', 302)

  const autoanswers = await Autoanswer.find({ user }).sort({ _id: -1 })
  const format = autoanswers.map((item, index) => {
    return {
      place: index + 1,
      rating: [item.ratingFilterFrom, item.ratingFilterTo],
      product: item.product,
      text: item.text,
      article: item.article,
      status: item.status,
      id: item._id,
    }
  })
  return format
})
