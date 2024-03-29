import ExcelJS from 'exceljs'

import type { Document } from 'mongoose'
import { Delivery } from '@/server/lib/models/ozon/Delivery'
import { Buyout } from '@/server/lib/models/ozon/Buyout'
import { Buyoutlog } from '@/server/lib/models/ozon/Buyoutlog'
import { User } from '@/server/lib/models/User'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { getServerSession } from '#auth'
import { ActionHistory } from '@/server/lib/models/actionHistory'

const keys = Object.keys as <T>(
  obj: T
) => (keyof T extends infer U
  ? U extends string
    ? U
    : U extends number
    ? `${U}`
    : never
  : never)[]

async function getReady(user: any, pvzs: any) {
  const deliveries = await Delivery.find({
    user: { $in: user },
    point: pvzArray && pvzArray.length ? { $in: pvzArray } : { $exists: true },
  })
  const prefixesToRemove =
    /(г\.?|д\.?|с\.?|село|п\.?|пос\.?|посёлок|дер\.?|деревня|поселок городского типа|посёлок станции)\s*/gi

  const filtered: any = deliveries
    .filter((item) => {
      const currentstatus = item.statusdelivery?.length
        ? item.statusdelivery[item.statusdelivery.length - 1].status
        : 'Неизвестно'
      return (
        currentstatus === 'Готов к выдаче' ||
        currentstatus === 'Готов к получению'
      )
    })
    .sort((a: any, b: any) =>
      a.point
        .replace(prefixesToRemove, '')
        .replace(/[^а-яё]/gi, '')
        .localeCompare(
          b.point.replace(prefixesToRemove, '').replace(/[^а-яё]/gi, ''),
          'ru',
          {
            sensitivity: 'accent',
          }
        )
    )

  const format = await Promise.all(
    filtered
      .map(async (delivery: any, index: any) => {
        const buyout = await Buyout.findOne({ _id: delivery.idbuyout })

        if (!buyout) return undefined
        const logs = await Buyoutlog.find({ buyout: buyout._id })
        const foundLog = logs.find((item) =>
          item.text.includes('Выкуп выполнен')
        )
        const finishDate = new Date(foundLog ? foundLog.date : buyout.createdAt)
        const place = index + 1
        const finishDateHours = finishDate.getHours()
        const finishDateMinutes = finishDate.getMinutes()
        const finishTime = `${finishDateHours
          .toString()
          .padStart(2, '0')}:${finishDateMinutes.toString().padStart(2, '0')}`

        const phone: any = delivery.recipientphone
        const replaced = `+${phone[0]} (***) *** ${phone.slice(7)}`
        const currentstatus = delivery.statusdelivery?.length
          ? delivery.statusdelivery[delivery.statusdelivery.length - 1].status
          : 'Неизвестно'
        const statusupdated = delivery.statusdelivery?.length
          ? new Date(
              delivery.statusdelivery[delivery.statusdelivery.length - 1].date
            )
          : new Date()
        const deliveryDate = delivery.statusdelivery?.length
          ? new Date(
              delivery.statusdelivery?.find(
                (item: any) =>
                  item.status === 'Готов к выдаче' ||
                  item.status === 'Готов к получению'
              )?.date
            )
          : new Date()
        const expireDate = new Date(
          deliveryDate.getTime() + 1000 * 60 * 60 * 24 * 7
        )
        let username = ''

        user.forEach((el: any) => {
          if (el._id.valueOf() === buyout.user.valueOf()) {
            username = el.username
          }
        })

        return {
          index,
          place,
          username,
          uuid: buyout.uuid,
          article: delivery.article,
          pricebuy: delivery.pricebuy,
          size: buyout.sizeparam,
          point: delivery.point,
          deliveryDate,
          expireDate,
          statusdelivery: delivery.statusdelivery,
          currentstatus,
          statusupdated,
          productname: buyout.product.name,
          receiptcode: delivery.receiptcode ? delivery.receiptcode : undefined,
          receiptcodeqr: delivery.receiptcodeqr
            ? delivery.receiptcodeqr
            : undefined,
          recipient: delivery.recipient,
          createdAt: new Date(buyout.createdAt),
          recipientphone: replaced,
          finishDate,
          finishTime,
          updatedAt: new Date(delivery.updatedAt),
        }
      })
      .filter((item: any) => item !== undefined)
  )

  return format
}

export default eventHandler(async (event) => {
  try {
    const session = (await getServerSession(event)) as any
    const adminUser = await AdminUser.findOne({ uuid: session.uuid })
    if (
      !adminUser ||
      (!adminUser.mainAdmin &&
        !adminUser.tabs.includes('товары готовые к выдаче'))
    )
      return sendRedirect(event, '/auth', 302)

    const { type, uuid, pvzs } = getQuery(event)

    const user = await User.find({ uuid })
    if (!user || user.length === 0) {
      throw createError({
        statusCode: 400,
        message: 'Пользователь не найден',
      })
    }

    await ActionHistory.create({
      adminUser: adminUser._id,
      usersUuid: uuid,
      actionId: 102,
      actionDescription: `Админ ${adminUser.uuid} - ${adminUser.username} экспорт общей таблицы excel`,
      date: new Date(),
    })

    // if (!adminUser.isAllUsersAllowed) {
    //   const allowedUsersParam = adminUser.allowedUsers.map(
    //     (item: any) => item.valueOf
    //   )
    //   const restrictedUsersParam = adminUser.restrictedUsers.map(
    //     (item: any) => item.valueOf
    //   )

    //   if (
    //     !allowedUsersParam.includes(user._id.valueOf()) ||
    //     restrictedUsersParam.includes(user._id.valueOf())
    //   ) {
    //     throw createError({
    //       statusCode: 400,
    //       message: 'Пользователь не разрешен',
    //     })
    //   }
    // }

    const workbook = new ExcelJS.Workbook()
    const ready = (await getReady(user, pvzs)).filter(
      (item) => item !== undefined
    )

    const sheet = workbook.addWorksheet('Готовы к выдаче', {
      headerFooter: { firstHeader: `Всего доставок: ${ready.length}` },
    })

    sheet.columns = [
      { header: 'Номер', key: 'place', font: { bold: true } },
      { header: 'QR код', key: 'receiptcode', width: 16, font: { bold: true } },
      {
        header: 'Статус',
        key: 'currentstatus',
        width: 16,
        font: { bold: true },
      },
      { header: 'Товар', key: 'productname', width: 48, font: { bold: true } },
      {
        header: 'Пользователь',
        key: 'username',
        width: 16,
        font: { bold: true },
      },
      { header: 'Артикул', key: 'article', width: 16, font: { bold: true } },
      { header: 'Размер', key: 'size', width: 16, font: { bold: true } },
      {
        header: 'Дата создания заказа',
        key: 'finishDate',
        width: 16,
        font: { bold: true },
      },
      {
        header: 'Время создания заказа',
        key: 'finishTime',
        width: 16,
        font: { bold: true },
      },
      {
        header: 'Дата доставки в ПВЗ',
        key: 'deliveryDate',
        width: 16,
        font: { bold: true },
      },
      {
        header: 'Дата окончания срока забора с ПВЗ',
        key: 'expireDate',
        width: 16,
        font: { bold: true },
      },
      {
        header: 'Код ПВЗ',
        key: 'receiptcode',
        width: 16,
        font: { bold: true },
      },
      { header: 'ID Выкупа', key: 'uuid', width: 16, font: { bold: true } },
      { header: 'ПВЗ', key: 'point', width: 64, font: { bold: true } },
      {
        header: 'Получатель',
        key: 'recipient',
        width: 16,
        font: { bold: true },
      },
      {
        header: 'Телефон',
        key: 'recipientphone',
        width: 16,
        font: { bold: true },
      },
      {
        header: 'Дата обновления',
        key: 'updatedAt',
        width: 16,
        font: { bold: true },
      },
    ]

    sheet.addRows(ready)
    // add qr codes to sheet

    for (const item of ready) {
      if (!item?.receiptcodeqr || item?.receiptcodeqr?.length < 40) {
        continue
      }

      if (
        item.receiptcodeqr.includes(
          'data:image/png;base64,data:image/png;base64,'
        )
      ) {
        item.receiptcodeqr = item.receiptcodeqr.replace(
          'data:image/png;base64,',
          ''
        )
      }

      try {
        const image = workbook.addImage({
          base64: item?.receiptcodeqr,
          extension: 'png',
        })
        sheet.addImage(image, {
          tl: { col: 1, row: item!.place },
          ext: { width: 100, height: 100 },
        })
        sheet.getRow(item!.place + 1).height = 100
      } catch (error) {
        console.log(error)

        continue
      }
    }
    // export table
    const buffer = await workbook.xlsx.writeBuffer()

    return buffer
  } catch (e) {
    console.log(e)
    throw createError({
      statusCode: 500,
      message: 'Не удалось создать таблицу',
    })
  }
})
