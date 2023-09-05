import { getServerSession } from '#auth'
import { User } from '~~/server/lib/models/User'
import { Like } from '~~/server/lib/models/Like'
import { findImage } from '~~/server/lib/helpers'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session)
    return sendRedirect(event, '/auth', 302)

  const user = await User.findOne({ uuid: session.uuid })
  if (!user)
    return sendRedirect(event, '/auth', 302)

  const body = await readBody(event)
  const article = body.article
  const reviews: any[] = body.reviews
  let likes = 0
  let dislikes = 0
  reviews.forEach((review: any) => {
    likes += review.likes
    dislikes += review.dislikes
  })
  if (!article || !reviews) {
    throw createError({
      statusCode: 400,
      message: 'no article or reviews',
    })
  }
  const image = findImage(Number(article))
  const created = new Like({
    user,
    article,
    reviews,
    likes,
    dislikes,
    total: likes + dislikes,
    image,
    createdDate: new Date(),
  })
  await created.save()
  return {
    status: 'ok',
  }
})
