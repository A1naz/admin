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

  const { name } = await readBody(event)

  if (!name || name.trim().length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Название площадки обязательно',
    })
  }

  // Проверяем, не существует ли уже площадка с таким именем
  const existingPlatform = await UTMPlatform.findOne({ name: name.trim() })
  if (existingPlatform) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Площадка с таким именем уже существует',
    })
  }

  try {
    const newPlatform = await UTMPlatform.create({
      name: name.trim(),
      createdAt: new Date(),
    })

    return {
      success: true,
      platform: newPlatform,
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Ошибка при создании площадки',
    })
  }
})

