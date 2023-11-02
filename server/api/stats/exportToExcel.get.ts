import ExcelJS from 'exceljs'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { getServerSession } from '#auth'
import { User } from '@/server/lib/models/User'
import { paymenthistory } from '~/server/lib/models/Paymenthistory'
import { ActionHistory } from '~/server/lib/models/actionHistory'

let limit = 50000
const runtimeConfig = useRuntimeConfig()

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
    if (!session) return sendRedirect(event, '/auth', 302)
    const user = await AdminUser.findOne({ uuid: session.uuid })
    if (!user || !user.tabs.includes('финансовые операции'))
      return sendRedirect(event, '/auth', 302)

    const { page, filters, sortDate }: any = getQuery(event)

    const workbook = new ExcelJS.Workbook()

    const trueFilters = JSON.parse(filters)
    if (!trueFilters.sumTo) delete trueFilters.sumTo
    if (!trueFilters.sumFrom) delete trueFilters.sumFrom

    let userIds = {}
    if (trueFilters.clients !== null) {
      userIds = { user: { $in: trueFilters.clients } }
    }
    // const users = await User.find({ _id: { $in: trueFilters.clients}})

    const trueTypeoperations =
      trueFilters.typeoperations == 'any'
        ? {}
        : { typeoperations: trueFilters.typeoperations }
    const trueType = trueFilters.type == 'any' ? {} : { type: trueFilters.type }
    const trueDateRange = trueFilters.dateRange
      ? {
          dataoperation: {
            $gte: new Date(trueFilters.dateRange[0]).setHours(0, 0, 0, 0),
            $lt: new Date(trueFilters.dateRange[1]).setHours(23, 59, 0, 0),
          },
        }
      : {}

    let stats: any = await paymenthistory
      .find({
        ...userIds,
        ...trueTypeoperations,
        ...trueType,
        ...trueDateRange,
      })
      .sort({
        dataoperation: sortDate,
      })
      .limit(limit)

    const statsCount: any = await paymenthistory.count()

    const statsUsersIds: any = stats.map((operation: any) => operation.user)

    const users = await User.find({ _id: { $in: statsUsersIds } })

    const format = <any>[]

    for (const stat of stats) {
      // const user: any = await User.findById(stat.user)
      const user = users.find((user: any) => user._id.equals(stat.user))
      format.push({
        ...stat._doc,
        userUuid: user ? user.uuid : '',
        email: user ? user.email : '',
        username: user ? user.username : '',
        telegram: user ? user.telegram : '',
      })
    }

    const ready = format

    const sheet = workbook.addWorksheet('Отчет о платежах', {
      headerFooter: { firstHeader: `Всего: ${ready.length}` },
    })

    sheet.columns = [
      { header: 'ID', key: '_id', width: 48, font: { bold: true } },
      { header: 'userId', key: 'userUuid', width: 50, font: { bold: true } },
      { header: 'email', key: 'email', width: 50, font: { bold: true } },
      { header: 'username', key: 'username', width: 50, font: { bold: true } },
      { header: 'telegram', key: 'telegram', width: 50, font: { bold: true } },
      {
        header: 'сумма',
        key: 'summ',
        width: 16,
        font: { bold: true },
      },
      {
        header: 'тип операции',
        key: 'typeoperations',
        width: 16,
        font: { bold: true },
      },
      {
        header: 'базис',
        key: 'basisoperation',
        width: 60,
        font: { bold: true },
      },
      {
        header: 'комментарии',
        key: 'comment',
        width: 48,
        font: { bold: true },
      },
      {
        header: 'Дата операции',
        key: 'dataoperation',
        width: 16,
        font: { bold: true },
      },
    ]

    sheet.addRows(ready)
    // add qr codes to sheet

    // for (const item of ready) {
    //   const image = workbook.addImage({
    //     base64: item?.receiptcodeqr,
    //     extension: 'png',
    //   })
    //   sheet.addImage(image, {
    //     tl: { col: 1, row: item!.place },
    //     ext: { width: 100, height: 100 },
    //   })
    //   sheet.getRow(item!.place + 1).height = 100
    // }
    // // export table

    await ActionHistory.create({
      adminUser: user._id,
      actionId: 32,
      actionDescription: `Экспорт в эксель`,
      date: new Date(),
    })

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
