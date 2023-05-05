import * as fs from 'node:fs'
import { Readable } from 'node:stream'
import * as XLSX from 'xlsx'

// @ts-expect-error not declaring module
import * as cpexcel from 'xlsx/dist/cpexcel.full.mjs'
import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { Delivery } from '@/server/lib/models/Delivery'
import { Buyout } from '@/server/lib/models/Buyout'

XLSX.set_fs(fs)
XLSX.stream.set_readable(Readable)
XLSX.set_cptable(cpexcel)

const keys = Object.keys as <T>(obj: T) =>
(keyof T extends infer U ? U extends string ? U : U extends number ? `${U}` : never : never)[]
export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session)
    return sendRedirect(event, '/auth', 302)

  const user = await User.findOne({ uuid: session.uuid })
  if (!user)
    return sendRedirect(event, '/auth', 302)

  const deliveries = await Delivery.find({ user }).sort({ _id: -1 })
  if (!deliveries.length) {
    throw createError({
      statusCode: 400,
      message: 'Нет доставок для экспорта',
    })
  }
  const format = await Promise.all(
    deliveries.map(async (delivery) => {
      const buyout = await Buyout.findOne({ _id: delivery.idbuyout })
      if (!buyout)
        return

      const phone = delivery.recipientphone
      const replaced = `+${phone[0]} (***) *** ${phone.slice(7)}`

      return {
        point: delivery.point,
        recipient: delivery.recipient,
        recipientphone: replaced,
        receiptcode: delivery.receiptcode ? delivery.receiptcode : undefined,
        currentstatus:
          delivery.statusdelivery[delivery.statusdelivery.length - 1].status,
        article: delivery.article.toString(),
        size: buyout.sizeparam,
        productname: buyout.product.name,
        uuid: buyout.uuid,
        pricebuy: delivery.pricebuy,
        updatedAt: delivery.updatedAt,
      }
    }),
  )
  const worksheet = XLSX.utils.json_to_sheet(format)
  XLSX.utils.sheet_add_aoa(worksheet, [['Пункт выдачи', 'Имя', 'Телефон', 'Код выдачи', 'Статус', 'Артикул', 'Размер', 'Товар', 'ID заказа', 'Цена', 'Обновлено']], { origin: 'A1' })
  const max_width = format.reduce((w, r) => Math.max(w, r!.point.length), 10)
  const columnWidths: XLSX.ColInfo[] | { wch: any }[] | undefined = []
  keys(format[0]!).forEach((key) => {
    const obj = format[0]!
    const min = 10
    const propLength = obj[key].toString().length + 1
    const width = Math.max(min, propLength)
    columnWidths.push({ wch: width })
  })
  worksheet['!cols'] = columnWidths
  worksheet['!rows'] = [{ hpt: 30 }]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Доставки')

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
  return buffer
})
