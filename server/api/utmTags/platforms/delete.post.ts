import { UTMPlatform } from '~/server/lib/models/UTMPlatform'
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

  const { platformId } = await readBody(event)

  if (!platformId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID площадки обязателен',
    })
  }

  try {
    const platform = await UTMPlatform.findById(platformId)
    
    if (!platform) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Площадка не найдена',
      })
    }

    await UTMPlatform.deleteOne({ _id: platformId })

    return {
      success: true,
      message: 'Площадка удалена',
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Ошибка при удалении площадки',
    })
  }
})

