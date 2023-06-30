import ExcelJS from 'exceljs'

import type { Document } from 'mongoose'
import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { Delivery } from '@/server/lib/models/Delivery'
import { Buyout } from '@/server/lib/models/Buyout'

const keys = Object.keys as <T>(obj: T) =>
(keyof T extends infer U ? U extends string ? U : U extends number ? `${U}` : never : never)[]

async function getReady(user: Document) {
  const deliveries = await Delivery.find({ user }).sort({ _id: -1 })
  const filtered = deliveries.filter((item) => {
    return item.statusdelivery[item.statusdelivery.length - 1].status === 'Готов к выдаче' || item.statusdelivery[item.statusdelivery.length - 1].status === 'Готов к получению'
  })
  const format = await Promise.all(
    filtered.map(async (delivery, index) => {
      const buyout = await Buyout.findOne({ _id: delivery.idbuyout })
      if (!buyout)
        return
      const place = index + 1

      const phone = delivery.recipientphone
      const replaced = `+${phone[0]} (***) *** ${phone.slice(7)}`

      return {
        index,
        place,
        uuid: buyout.uuid,
        article: delivery.article,
        pricebuy: delivery.pricebuy,
        size: buyout.sizeparam,
        point: delivery.point,
        statusdelivery: delivery.statusdelivery,
        currentstatus:
          delivery.statusdelivery[delivery.statusdelivery.length - 1].status,
        statusupdated:
          new Date(delivery.statusdelivery[delivery.statusdelivery.length - 1].date),

        productname: buyout.product.name,
        productimage: buyout.product.image,
        receiptcode: delivery.receiptcode ? delivery.receiptcode : undefined,
        receiptcodeqr: delivery.receiptcodeqr
          ? delivery.receiptcodeqr
          : undefined,
        recipient: delivery.recipient,
        recipientphone: replaced,
        updatedAt: new Date(delivery.updatedAt),
      }
    }).filter(item => item !== undefined),
  )

  return format
}

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session)
    return sendRedirect(event, '/auth', 302)

  const user = await User.findOne({ uuid: session.uuid })
  if (!user)
    return sendRedirect(event, '/auth', 302)
  const { type } = getQuery(event)
  const workbook = new ExcelJS.Workbook()
  const ready = await getReady(user)
  const sheet = workbook.addWorksheet('Готовы к выдаче', {
    headerFooter: { firstHeader: `Всего выкупов: ${ready.length}` },
  })

  sheet.columns = [
    { header: 'Номер', key: 'place', font: { bold: true } },
    { header: 'QR код', key: 'receiptcode', width: 16, font: { bold: true } },
    { header: 'Код получения', key: 'receiptcode', width: 16, font: { bold: true } },
    { header: 'Статус', key: 'currentstatus', width: 16, font: { bold: true } },
    { header: 'Дата обновления статуса', key: 'statusupdated', width: 16, font: { bold: true } },
    { header: 'Адрес пункта выдачи', key: 'point', width: 64, font: { bold: true } },
    { header: 'Товар', key: 'productname', width: 48, font: { bold: true } },
    { header: 'Получатель', key: 'recipient', width: 16, font: { bold: true } },
    { header: 'Телефон получателя', key: 'recipientphone', width: 16, font: { bold: true } },
    { header: 'Дата обновления', key: 'updatedAt', width: 16, font: { bold: true } },
    { header: 'ID Выкупа', key: 'uuid', width: 16, font: { bold: true } },
  ]

  sheet.addRows(ready)
  // add qr codes to sheet

  for (const item of ready) {
    const image = workbook.addImage({
      base64: item?.receiptcodeqr,
      extension: 'png',
    })
    sheet.addImage(image, {
      tl: { col: 1, row: item!.place },
      ext: { width: 100, height: 100 },
    })
    sheet.getRow(item!.place + 1).height = 100
  }
  // export table
  const buffer = await workbook.xlsx.writeBuffer()
  return buffer
})
