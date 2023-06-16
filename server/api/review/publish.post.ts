import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { Delivery } from '@/server/lib/models/Delivery'
import { Buyout } from '@/server/lib/models/Buyout'
import { Review } from '@/server/lib/models/Review'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session)
    return sendRedirect(event, '/auth', 302)

  const body = await readBody(event)
  const user = await User.findOne({ uuid: session.uuid })
  if (!user)
    return sendRedirect(event, '/auth', 302)

  const { buyoutuuid, deliveryid, rating, text, photos, date } = body
  if (text.length < 10 || text.length > 1000) {
    throw createError({
      statusCode: 400,
      message: 'Текст отзыва должен быть длиннее 10 символов и не больше 1000',
    })
  }
  const buyout = await Buyout.findOne({ uuid: buyoutuuid })
  if (!buyout) {
    return createError({
      statusCode: 400,
      message: 'Выкуп не найден',
    })
  }
  const delivery = await Delivery.findOne({_id: deliveryid, idbuyout: buyout._id, reviewed: false })
  if (!delivery) {
    return createError({
      statusCode: 400,
      message: 'Доставка не найдена',
    })
  }
  const images = photos.map((photo: any) => photo.public)

  const review = new Review({
    article: buyout.article,
    name: buyout.product.name,
    rating,
    text,
    date,
    user,
    delivery,
    images,
    status: 'waiting',
    recipientphone: delivery.recipientphone,
  })
  await review.save()
  delivery.reviewed = true
  const saved = await delivery.save()
  console.log(saved)
  return {
    message: 'Отзыв успешно добавлен',
  }
})
