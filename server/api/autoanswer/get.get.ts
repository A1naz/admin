import { getServerSession } from '#auth'
import { User } from '~~/server/lib/models/User'
import { Autoanswer } from '~~/server/lib/models/Autoanswer'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session)
    return sendRedirect(event, '/auth', 302)

  const user = await User.findOne({ uuid: session.uuid })
  if (!user)
    return sendRedirect(event, '/auth', 302)

  const autoanswers = await Autoanswer.find({ user }).sort({ _id: -1 })
  const format = autoanswers.map((item, index) => {
    return {
      place: index + 1,
      product: item.product,
      text: item.text,
      article: item.article,
    }
  })
  return format
})
