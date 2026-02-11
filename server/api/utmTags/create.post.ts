import { UTMTag } from '~/server/lib/models/UTMTag'
import { UTMCategory } from '~/server/lib/models/UTMCategory'
import { UTMPlatform } from '~/server/lib/models/UTMPlatform'
import { getServerSession } from '#auth'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { randomBytes } from 'crypto'

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

  const { name, categoryId, platformId } = await readBody(event)

  if (!name || name.trim().length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Название метки обязательно',
    })
  }

  // Проверяем, не существует ли уже метка с таким именем
  const existingTag = await UTMTag.findOne({ name: name.trim() })
  if (existingTag) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Метка с таким именем уже существует',
    })
  }

  // Генерируем уникальный utm код
  const generateUtmCode = () => {
    const randomPart = randomBytes(4).toString('hex')
    return `utm_${randomPart}`
  }

  let utmCode = generateUtmCode()
  
  // Проверяем уникальность кода (на всякий случай)
  let codeExists = await UTMTag.findOne({ utmCode })
  while (codeExists) {
    utmCode = generateUtmCode()
    codeExists = await UTMTag.findOne({ utmCode })
  }

  try {
    // Получаем названия категории и площадки, если они выбраны
    let categoryName = null
    let platformName = null

    if (categoryId) {
      const category = await UTMCategory.findById(categoryId)
      categoryName = category?.name || null
    }

    if (platformId) {
      const platform = await UTMPlatform.findById(platformId)
      platformName = platform?.name || null
    }

    const newTag = await UTMTag.create({
      name: name.trim(),
      utmCode,
      createdBy: user._id,
      createdByUsername: user.username,
      category: categoryId || null,
      categoryName,
      platform: platformId || null,
      platformName,
      createdAt: new Date(),
      transitionToLanding: 0,
      transitionToPortal: 0,
      registrationsCount: 0,
      paymentsCount: 0,
    })

    return {
      success: true,
      tag: newTag,
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Ошибка при создании метки',
    })
  }
})

