import ExcelJS from 'exceljs'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { getServerSession } from '#auth'
import { User } from '@/server/lib/models/User'
import { paymenthistory } from '~/server/lib/models/Paymenthistory'
import { ActionHistory } from '~/server/lib/models/actionHistory'
import { Buyout } from '~/server/lib/models/Buyout'
import { Buyout as OzonBuyout } from '~/server/lib/models/ozon/Buyout'
import { ObjectId } from 'mongodb'

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

    const allowedUsersParam = user.isAllUsersAllowed
      ? {
          client: { $nin: user.restrictedUsers.map((id: any) => id) },
        }
      : {
          $and: [
            { client: { $in: user.allowedUsers.map((id: any) => id) } },
            { client: { $nin: user.restrictedUsers.map((id: any) => id) } },
          ],
        }

    const { page, filters, sortDate, mp }: any = getQuery(event)

    const workbook = new ExcelJS.Workbook()

    const trueFilters = JSON.parse(filters)
    let commentRegex = {}
    if (trueFilters.type == 'penalty') {
      commentRegex = {
        comment: { $regex: 'Штраф', $options: 'i' },
      }
    }
    let productsCountInfo = {
      count: 0,
      sum: 0,
    }
    if (!trueFilters.sumTo) delete trueFilters.sumTo
    if (!trueFilters.sumFrom) delete trueFilters.sumFrom
    if (trueFilters.type !== 'buyouts') {
      delete trueFilters.article
    } else if (trueFilters.type == 'buyouts' && trueFilters.article) {
      const buyoutsWithThisArticle = await Buyout.find({
        article: trueFilters.article,
      }).sort({
        createdAt: sortDate,
      })

      const buyoutsUuids: string[] = []

      if (buyoutsWithThisArticle && buyoutsWithThisArticle.length > 0) {
        for (const buyout of buyoutsWithThisArticle) {
          buyoutsUuids.push(`Выкуп #${buyout.uuid}`)
        }
        trueFilters.basisoperation = { basisoperation: { $in: buyoutsUuids } }
      } else {
        return {
          stats: [],
          statsCount: 0,
        }
      }
    }

    let userIds = {}
    if (trueFilters.clients !== null) {
      userIds = { user: { $in: trueFilters.clients } }
    }
    // const users = await User.find({ _id: { $in: trueFilters.clients}})
    let limit = trueFilters.type == 'buyouts' ? 20000 : 100000
    const trueTypeoperations =
      trueFilters.typeoperations == 'any'
        ? {}
        : { typeoperations: trueFilters.typeoperations }
    const trueType =
      trueFilters.type == 'any' || trueFilters.type == 'penalty'
        ? {}
        : { type: trueFilters.type }
    const trueDateRange = trueFilters.dateRange
      ? {
          dataoperation: {
            $gte: new Date(trueFilters.dateRange[0]).setHours(0, 0, 0, 0),
            $lt: new Date(trueFilters.dateRange[1]).setHours(23, 59, 0, 0),
          },
        }
      : {}

    let stats: any = []

    stats = await paymenthistory
      .find({
        mp: mp == 'all' ? { $exists: true } : mp,
        ...commentRegex,
        ...allowedUsersParam,
        ...trueFilters.basisoperation,
        ...userIds,
        ...trueTypeoperations,
        ...trueType,
        ...trueDateRange,
      })
      .limit(limit)
    // .sort({
    //   dataoperation: sortDate,
    // })

    const statsUsersIds: any = stats.map((operation: any) => operation.user)
    const users: any = await User.find({ _id: { $in: statsUsersIds } })
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

    if (
      trueFilters.type == 'buyouts'
      //  || trueFilters.type == 'any'
    ) {
      let buyoutsUuids: string[] = []
      const buyoutIds: ObjectId[] = []

      const paymentAggregate = await paymenthistory.aggregate([
        {
          $match: {
            mp: mp == 'all' ? { $exists: true } : mp,
            ...allowedUsersParam,
            ...trueFilters.basisoperation,
            ...userIds,
            ...trueTypeoperations,
            type: { $in: ['buyouts', 'buyouts service'] },
            ...trueDateRange,
          },
        },
        {
          $group: {
            _id: 'null',
            sum: { $sum: '$summ' },
            count: { $sum: 1 },
          },
        },
      ])

      if (paymentAggregate && paymentAggregate.length > 0) {
        productsCountInfo = {
          count: paymentAggregate[0].count,
          sum: paymentAggregate[0].sum,
        }
      }

      for (const buyout of format) {
        if (
          (buyout.type == 'buyouts' || buyout.type == 'buyouts service') &&
          buyout.basisoperation
        ) {
          if (buyout.basisoperation.includes('Выкуп #')) {
            buyoutsUuids.push(
              buyout.basisoperation.split(' ')[1].replace('#', '')
            )
          } else {
            buyoutIds.push(new ObjectId(buyout.basisoperation))
          }
        }
      }

      const buyouts = await Buyout.find({ uuid: { $in: buyoutsUuids } })
      const ozonBuyouts = await OzonBuyout.find({ _id: { $in: buyoutIds } })

      format.forEach((stat: any) => {
        if (stat.type == 'buyouts' || stat.type == 'buyouts service') {
          const buyout = stat.basisoperation.includes('Выкуп #')
            ? buyouts.find(
                (buyout: any) =>
                  buyout.uuid ==
                  stat.basisoperation.split(' ')[1].replace('#', '')
              )
            : ozonBuyouts.find(
                (buyout: any) => buyout._id.valueOf() == stat.basisoperation
              )

          stat.article = buyout ? buyout.article : ''
          stat.productName = buyout ? buyout.product.name : ''
        }
      })
    }

    const ready = format.map((el: any) => {
      if (el.type == 'buyouts' || el.type == 'buyouts service') {
        return {
          ...el,
          summ: Number(el.summ),
        }
      } else {
        return {
          ...el,
          summ: Number(el.summ),
          article: '',
        }
      }
    })

    const sheet = workbook.addWorksheet('Отчет о платежах', {
      headerFooter: { firstHeader: `Всего: ${ready.length}` },
    })

    const columns = [
      { header: 'ID', key: '_id', width: 48, font: { bold: true } },
      { header: 'userId', key: 'userUuid', width: 40, font: { bold: true } },
      { header: 'email', key: 'email', width: 30, font: { bold: true } },
      { header: 'username', key: 'username', width: 20, font: { bold: true } },
      { header: 'telegram', key: 'telegram', width: 20, font: { bold: true } },
      { header: 'Маркетплейс', key: 'mp', width: 14, font: { bold: true } },
      {
        header: 'сумма',
        key: 'summ',
        width: 16,
        font: { bold: true },
        numFmt: '0.00',
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
        width: 28,
        font: { bold: true },
      },
      {
        header: 'Дата операции',
        key: 'dataoperation',
        width: 16,
        font: { bold: true },
      },
    ]

    if (trueFilters.type == 'buyouts' || trueFilters.type == 'any') {
      columns.splice(8, 0, {
        header: 'Товар',
        key: 'productName',
        width: 60,
        font: { bold: true },
      })
      columns.splice(9, 0, {
        header: 'Артикул',
        key: 'article',
        width: 16,
        font: { bold: true },
      })
    }

    sheet.columns = columns

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
