import { getServerSession } from '#auth'
import { User } from '~~/server/lib/models/User'
import { Autoanswer } from '~~/server/lib/models/Autoanswer'
import { findImage } from '~~/server/lib/helpers'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session)
    return sendRedirect(event, '/auth', 302)

  const user = await User.findOne({ uuid: session.uuid })
  if (!user)
    return sendRedirect(event, '/auth', 302)

  const body = await readBody(event)
  const { article, ratingFilterFrom, ratingFilterTo, text, product } = body
  if (!article || !ratingFilterFrom || !ratingFilterTo || !text || !product) {
    throw createError({
      statusCode: 400,
      message: 'Некорректный запрос',
    })
  }
  if (!user.wbApiKey) {
    throw createError({
      statusCode: 400,
      message: 'Добавьте апи ключ Wildberries для работы автоответчика!',
    })
  }

  const image = findImage(Number(article))
  product.image = image
  const found = await Autoanswer.findOne({ user, article, ratingFilterFrom, ratingFilterTo })

  if (found) {
    console.log(found)
    throw createError({
      statusCode: 400,
      message: 'Автоответчик с таким фильтром оценок уже существует.',
    })
  }
  const created = new Autoanswer({
    user,
    ratingFilterFrom: parseInt(ratingFilterFrom),
    ratingFilterTo: parseInt(ratingFilterTo),
    text,
    article,
    product,
  })
  await created.save()
  return {
    status: 'ok',
  }
})
