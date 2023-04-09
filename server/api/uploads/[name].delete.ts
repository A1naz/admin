import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { Upload } from '~~/server/lib/models/Upload'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session)
    return sendRedirect(event, '/auth', 302)

  const user = await User.findOne({ uuid: session.uuid })
  if (!user)
    return sendRedirect(event, '/auth', 302)

  const name = event.context.params?.name
  if (!name) {
    return createError({
      statusCode: 400,
      message: 'Не указано имя файла',
    })
  }
  const upload = await Upload.findOne({ filename: name })
  if (!upload) {
    return createError({
      statusCode: 400,
      message: 'Файл не найден',
    })
  }
  const removed = await Upload.findByIdAndDelete(upload._id)
  if (!removed) {
    return createError({
      statusCode: 400,
      message: 'Не удалось удалить файл',
    })
  }
  return {
    success: true,
  }
})
