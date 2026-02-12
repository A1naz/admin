import { UTMCategory } from '~/server/lib/models/UTMCategory'
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

  const { categoryId } = await readBody(event)

  if (!categoryId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID категории обязателен',
    })
  }

  try {
    const category = await UTMCategory.findById(categoryId)
    
    if (!category) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Категория не найдена',
      })
    }

    await UTMCategory.deleteOne({ _id: categoryId })

    return {
      success: true,
      message: 'Категория удалена',
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Ошибка при удалении категории',
    })
  }
})

