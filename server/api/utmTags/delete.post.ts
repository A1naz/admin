import { UTMTag } from '~/server/lib/models/UTMTag'
import { getServerSession } from '#auth'
import { AdminUser } from '~/server/lib/models/AdminUser'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const user = await AdminUser.findOne({ uuid: session.uuid })

  if (!user || (!user.mainAdmin && !user.tabs.includes('utm метки'))) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
    })
  }

  const { tagId } = await readBody(event)

  if (!tagId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID метки обязателен',
    })
  }

  try {
    const tag = await UTMTag.findById(tagId)
    
    if (!tag) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Метка не найдена',
      })
    }

    await UTMTag.deleteOne({ _id: tagId })

    return {
      success: true,
      message: 'Метка удалена',
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Ошибка при удалении метки',
    })
  }
})

