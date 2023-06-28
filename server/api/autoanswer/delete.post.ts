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

  const body = await readBody(event)
  const { id } = body
  const found = await Autoanswer.findById(id)
  if (!found) {
    throw createError({
      statusCode: 400,
      message: 'Не найден автоответчик',
    })
  }
  await found?.deleteOne()
  return {
    status: 'ok',
  }
})
