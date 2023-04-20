import { getServerSession } from '#auth'
import { User } from '~~/server/lib/models/User'
import { Like } from '~~/server/lib/models/Like'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session)
    return sendRedirect(event, '/auth', 302)

  const user = await User.findOne({ uuid: session.uuid })
  if (!user)
    return sendRedirect(event, '/auth', 302)

  const likes = await Like.find({ user }).sort({ _id: -1 })
  const format = likes.map((review, index) => {
    return {
      place: index + 1,
      image: review.image,
      article: review.article,
      likes: review.likes,
      dislikes: review.dislikes,
      status: review.status,
      total: review.total,
      createdDate: review.createdDate,
      endedDate: review.endedDate,
    }
  })
  return format
})
