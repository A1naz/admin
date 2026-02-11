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

  const { name } = await readBody(event)

  if (!name || name.trim().length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Название категории обязательно',
    })
  }

  // Проверяем, не существует ли уже категория с таким именем
  const existingCategory = await UTMCategory.findOne({ name: name.trim() })
  if (existingCategory) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Категория с таким именем уже существует',
    })
  }

  try {
    const newCategory = await UTMCategory.create({
      name: name.trim(),
      createdAt: new Date(),
    })

    return {
      success: true,
      category: newCategory,
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Ошибка при создании категории',
    })
  }
})

