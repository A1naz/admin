import ExcelJS from 'exceljs'
import { getServerSession } from '#auth'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { User } from '@/server/lib/models/User'

const tariffTranslations: { [key: string]: string } = {
  buyouts: 'Выкупы',
  review: 'Отзывы',
  deliveryStorage: 'Хранение',
  likeReview: 'Лайк на отзыв',
  likeProduct: 'Лайк на товар',
  questionProduct: 'Вопрос о товаре',
  reviewRemoving: 'Удаление отзыва',
  cart: 'В корзину',
  autoAnswer: 'Автоответ',
  reviewPhoto: 'Отзыв с фото',
  reviewVideo: 'Отзыв с видео',
  HotelsBuyouts: 'Выкупы Отелей',
  penalty: 'Штраф',
}

function formatValue(priceInfo: any) {
  if (!priceInfo || typeof priceInfo.value === 'undefined' || priceInfo.value === null) {
    return undefined
  }

  let value = priceInfo.value
  if (typeof value === 'object' && value !== null) {
    value = Object.values(value)[0]
  }

  const numValue = Number(value)
  if (isNaN(numValue)) {
    return undefined
  }

  if (priceInfo.type === 'percent') {
    return `${numValue}%`
  }

  return numValue
}

export default eventHandler(async (event) => {
  try {
    const session = (await getServerSession(event)) as any
    if (!session) return sendRedirect(event, '/auth', 302)

    const adminUser = await AdminUser.findOne({ uuid: session.uuid })
    if (!adminUser || !adminUser.mainAdmin) {
      throw createError({
        statusCode: 403,
        message: 'Доступ запрещен',
      })
    }

    const users = await User.find({
      MPTariffs: { $exists: true, $ne: [] },
    }).lean()

    if (!users.length) {
      throw createError({
        statusCode: 404,
        message: 'Пользователи с тарифами не найдены',
      })
    }

    const allHeaders = new Map<string, Set<string>>()
    users.forEach((user) => {
      user.MPTariffs?.forEach((mpTariff: any) => {
        const mp = mpTariff.mp
        if (!allHeaders.has(mp)) {
          allHeaders.set(mp, new Set())
        }
        const prices = mpTariff.prices || {}
        Object.keys(prices).forEach((key) => {
          if (key !== '_id' && key !== 'rules') {
            allHeaders.get(mp)!.add(key)
          }
        })
      })
    })

    const columns: Partial<ExcelJS.Column>[] = [
      {
        header: 'Логин',
        key: 'username',
        width: 25,
        font: { bold: true },
        alignment: { horizontal: 'right' },
      },
    ]

    const mpOrder = ['wildberries', 'ozon', 'ym', 'flowwow']
    const sortedMps = Array.from(allHeaders.keys()).sort((a, b) => {
      const indexA = mpOrder.indexOf(a)
      const indexB = mpOrder.indexOf(b)

      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB
      }
      if (indexA !== -1) {
        return -1
      }
      if (indexB !== -1) {
        return 1
      }
      return a.localeCompare(b)
    })

    for (const mp of sortedMps) {
      const sortedTariffKeys = Array.from(allHeaders.get(mp)!).sort()
      for (const tariffKey of sortedTariffKeys) {
        columns.push({
          header: `${mp} ${tariffTranslations[tariffKey] || tariffKey}`,
          key: `${mp}_${tariffKey}`,
          width: 28,
          font: { bold: true },
          alignment: { horizontal: 'right' },
        })
      }
    }

    const dataForExcel = users.map((user) => {
      const row: { [key: string]: any } = { username: user.username }

      const userTariffs = new Map<string, any>()
      user.MPTariffs?.forEach((mpTariff: any) => {
        userTariffs.set(mpTariff.mp, mpTariff.prices)
      })

      for (const mp of sortedMps) {
        const prices = userTariffs.get(mp) || {}
        const sortedTariffKeys = Array.from(allHeaders.get(mp)!).sort()
        for (const tariffKey of sortedTariffKeys) {
          const columnKey = `${mp}_${tariffKey}`
          row[columnKey] = formatValue(prices[tariffKey])
        }
      }
      return row
    })

    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('Тарифы пользователей')

    sheet.columns = columns
    sheet.addRows(dataForExcel)

    const buffer = await workbook.xlsx.writeBuffer()

    event.node.res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    event.node.res.setHeader(
      'Content-Disposition',
      'attachment; filename="user_tariffs.xlsx"'
    )

    return buffer
  } catch (e: any) {
    console.error('Error creating tariff export:', e)
    throw createError({
      statusCode: e.statusCode || 500,
      message: e.message || 'Не удалось создать таблицу',
    })
  }
})

  