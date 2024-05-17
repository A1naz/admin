import ExcelJS from 'exceljs'
import { Delivery } from '@/server/lib/models/Delivery'
import { Buyout } from '@/server/lib/models/Buyout'
import { getServerSession } from '#auth'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { User } from '@/server/lib/models/User'
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

    const { uuid, pvzs }: any = getQuery(event)

    const user = await User.find({ uuid: { $in: uuid } })
    if (!user || !user.length) {
      throw createError({
        statusCode: 400,
        message: 'Пользователи не найдены',
      })
    }

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

    const deliveries = await Delivery.find({
      user: { $in: user },
      point: pvzs && pvzs.length ? { $in: pvzs } : { $exists: true },
    }).sort({
      point: 1,
    })

    // if (!deliveries.length) {
    // return undefined
    // }
    const prefixesToRemove =
      /(г\.?|д\.?|с\.?|село|п\.?|пос\.?|посёлок|дер\.?|деревня|поселок городского типа|посёлок станции)\s*/gi
    const sorted = deliveries.sort((a: any, b: any) =>
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

    const buyoutsId = sorted.map(item => item.idbuyout);
    const buyouts = await Buyout.find({ _id: { $in: buyoutsId } })

    const runtimeConfig = useRuntimeConfig()
    const format = await Promise.all(
      sorted.map(async (delivery, index) => {
        const buyout = buyouts.find((item:any) => item._id.valueOf() === delivery.idbuyout.valueOf())

        if (!buyout) return null

        const phone = delivery.recipientphone || ''
        const replaced = `+${phone[0]} (***) *** ${phone.slice(7)}`
        const currentstatus = delivery.statusdelivery?.length
          ? delivery.statusdelivery[delivery.statusdelivery.length - 1].status
          : 'Неизвестно'

        let username = ''

        user.forEach((el: any) => {
          if (el._id.valueOf() === buyout.user.valueOf()) {
            username = el.username
          }
        })

        return {
          index,
          place: index + 1,
          point: delivery.point,
          username,
          recipient: delivery.recipient,
          recipientphone: replaced,
          receiptcodeqr: delivery.receiptcodeqr
            ? delivery.receiptcodeqr
            : undefined,
          receiptcode: delivery.receiptcode ? delivery.receiptcode : '',
          currentstatus,
          article: delivery.article.toString(),
          size: buyout.sizeparam,
          productname: buyout.product.name,
          uuid: `#${buyout.uuid}`,
          pricebuy: delivery.pricebuy,
          updatedAt: delivery.updatedAt,
        }
      })
    )

    const workbook = new ExcelJS.Workbook()
    const ready = format.filter((item) => item)
    const sheet = workbook.addWorksheet('Общая таблица', {
      headerFooter: { firstHeader: `Всего доставок: ${ready.length}` },
    })

    sheet.columns = [
      { header: 'Номер', key: 'place', font: { bold: true } },
      {
        header: 'Код получения',
        key: 'receiptcode',
        width: 16,
        font: { bold: true },
      },
      {
        header: 'Статус',
        key: 'currentstatus',
        width: 24,
        font: { bold: true },
      },
      {
        header: 'Пользователь',
        key: 'username',
        width: 24,
        font: { bold: true },
      },
      {
        header: 'Адрес пункта выдачи',
        key: 'point',
        width: 64,
        font: { bold: true },
      },
      { header: 'Товар', key: 'productname', width: 48, font: { bold: true } },
      {
        header: 'Получатель',
        key: 'recipient',
        width: 16,
        font: { bold: true },
      },
      {
        header: 'Телефон получателя',
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
      { header: 'ID Выкупа', key: 'uuid', width: 32, font: { bold: true } },
    ]
    sheet.addRows(ready)

    const idCol = sheet.getColumn('uuid')

    idCol.eachCell((cell, rowNumber) => {
      cell.value = {
        text: cell.value!.toString(),
        hyperlink: `${
          runtimeConfig.PUBLIC_SITE_URL
        }/buyouts?uuid=${cell.value?.toString()}`,
      }
    })
    // export table
    const buffer = await workbook.xlsx.writeBuffer()
    await ActionHistory.create({
      adminUser: adminUser._id,
      userUuids: uuid,
      actionId: 103,
      actionDescription: `Админ ${adminUser.uuid} - ${adminUser.username} экспорт общей таблицы excel`,
      date: new Date(),
    })
    return buffer
  } catch (e) {
    throw createError({
      statusCode: 500,
      message: 'Не удалось создать таблицу',
    })
  }
})
