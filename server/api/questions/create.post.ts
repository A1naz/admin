import { getServerSession } from '#auth'
import { User } from '@/server/lib/models/User'
import { Question } from '~/server/lib/models/Question'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session)
    return sendRedirect(event, '/auth', 302)

  const user = await User.findOne({ uuid: session.uuid })
  if (!user)
    return sendRedirect(event, '/auth', 302)

  const { productData, article, publishDate, gender, questionText } = await readBody(event)
  const { image } = productData

  if (questionText.length < 10 || questionText.length > 1000) {
    throw createError({
      statusCode: 400,
      message: 'Текст вопроса должен быть длиннее 10 символов и меньше 1000',
    })
  }
  const created = new Question({
    user,
    article,
    publishDate,
    gender,
    text: questionText,
    image,
  })
  await created.save()
  return {
    status: 'ok',
  }
})
