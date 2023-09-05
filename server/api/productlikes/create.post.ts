import { getServerSession } from '#auth'
import { User } from '@/server/lib/models/User'
import { ProductLike } from '@/server/lib/models/ProductLike'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session)
    return sendRedirect(event, '/auth', 302)

  const user = await User.findOne({ uuid: session.uuid })
  if (!user)
    return sendRedirect(event, '/auth', 302)

  const { url, amount, period, productData } = await readBody(event)
  if (amount > 1000 || amount <= 0) {
    throw createError({
      statusCode: 400,
      message: 'Не больше 1000 лайков за один заказ',
    })
  }
  const { type, image, name } = productData
  const created = new ProductLike({
    user,
    url,
    amount,
    period,
    type,
    image,
    name,
    createdDate: new Date(),
  })
  await created.save()
  return {
    status: 'ok',
  }
})
