import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { ProductLike } from '~~/server/lib/models/ProductLike'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session)
    return sendRedirect(event, '/auth', 302)

  const user = await User.findOne({ uuid: session.uuid })
  if (!user)
    return sendRedirect(event, '/auth', 302)
  const likes = await ProductLike.find({ user })
  const format = likes.map((like, index) => {
    return {
      place: index + 1,
      name: like.name,
      url: like.url,
      type: like.type,
      status: like.status,
      amount: like.amount,
      image: like.image,
      createdDate: like.createdDate,
      endedDate: like.endedDate || null,
    }
  })
  return format
})
