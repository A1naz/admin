import ExcelJS from 'exceljs'

import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { Delivery } from '@/server/lib/models/Delivery'
import { Buyout } from '@/server/lib/models/Buyout'

const keys = Object.keys as <T>(obj: T) =>
(keyof T extends infer U ? U extends string ? U : U extends number ? `${U}` : never : never)[]

export default eventHandler(async (event) => {
  try {
    const session = (await getServerSession(event)) as any

    if (!session)
      return sendRedirect(event, '/auth', 302)

    const user = await User.findOne({ uuid: session.uuid })
    if (!user)
      return sendRedirect(event, '/auth', 302)

    const runtimeConfig = useRuntimeConfig()
    const deliveries = await Delivery.find({ user }).sort({ _id: -1 })
    if (!deliveries.length) {
      throw createError({
        statusCode: 400,
        message: 'Нет доставок для экспорта',
      })
    }
    const format = await Promise.all(
      deliveries.map(async (delivery, index) => {
        const buyout = await Buyout.findOne({ _id: delivery.idbuyout })
        if (!buyout)
          return undefined

        const phone = delivery.recipientphone
        const replaced = `+${phone[0]} (***) *** ${phone.slice(7)}`

        return {
          index,
          place: index + 1,
          point: delivery.point,
          recipient: delivery.recipient,
          recipientphone: replaced,
          receiptcodeqr: delivery.receiptcodeqr
            ? delivery.receiptcodeqr
            : undefined,
          receiptcode: delivery.receiptcode ? delivery.receiptcode : '',
          currentstatus:
          delivery.statusdelivery[delivery.statusdelivery.length - 1].status,
          article: delivery.article.toString(),
          size: buyout.sizeparam,
          productname: buyout.product.name,
          uuid: `#${buyout.uuid}`,
          pricebuy: delivery.pricebuy,
          updatedAt: delivery.updatedAt,
        }
      }),
    )

    const workbook = new ExcelJS.Workbook()
    const ready = format.filter(item => item)
    const sheet = workbook.addWorksheet('Общая таблица', {
      headerFooter: { firstHeader: `Всего доставок: ${ready.length}` },
    })

    sheet.columns = [
      { header: 'Номер', key: 'place', font: { bold: true } },
      { header: 'Код получения', key: 'receiptcode', width: 16, font: { bold: true } },
      { header: 'Статус', key: 'currentstatus', width: 24, font: { bold: true } },
      { header: 'Адрес пункта выдачи', key: 'point', width: 64, font: { bold: true } },
      { header: 'Товар', key: 'productname', width: 48, font: { bold: true } },
      { header: 'Получатель', key: 'recipient', width: 16, font: { bold: true } },
      { header: 'Телефон получателя', key: 'recipientphone', width: 16, font: { bold: true } },
      { header: 'Дата обновления', key: 'updatedAt', width: 16, font: { bold: true } },
      { header: 'ID Выкупа', key: 'uuid', width: 32, font: { bold: true } },
    ]
    sheet.addRows(ready)

    const idCol = sheet.getColumn('uuid')

    idCol.eachCell((cell, rowNumber) => {
      cell.value = {
        text: cell.value!.toString(),
        hyperlink: `${runtimeConfig.PUBLIC_SITE_URL}/buyouts?uuid=${cell.value?.toString()}`,
      }
    })
    // export table
    const buffer = await workbook.xlsx.writeBuffer()
    return buffer
  }
  catch (e) {
    console.log(e)
    throw createError({
      statusCode: 500,
      message: 'Не удалось создать таблицу',
    })
  }
})
