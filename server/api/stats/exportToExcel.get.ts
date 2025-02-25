import ExcelJS from 'exceljs'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { getServerSession } from '#auth'
import { paymenthistory } from "~/server/lib/models/Paymenthistory"
import { ActionHistory } from "~/server/lib/models/actionHistory"
import getAll from './export/getAll'
import getAllBuyouts from './export/getAllBuyouts'
import getBuyoutsService from './export/getBuyoutsService'
import getBuyouts from './export/getBuyouts'
import getPenalty from './export/getPenalty'
import getCommonData from './export/getCommonData'

const limit = 5000

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)
  const user = await AdminUser.findOne({ uuid: session.uuid })
  if (!user || !user.tabs.includes('финансовые операции'))
    return sendRedirect(event, '/auth', 302)


  const workbook = new ExcelJS.Workbook()

  const { filters, mp }: any = getQuery(event)

  const trueFilters = JSON.parse(filters)

  const trueType =
    trueFilters.type == 'any'
      ? {}
      :
      trueFilters.type == 'allBuyouts' ?
        { type: { $in: ['buyouts', 'buyouts service'] } } :
        { type: trueFilters.type }


        console.log(trueFilters)
  const allData: any[] = []

  const dataCount = await paymenthistory.countDocuments({
    user: trueFilters.clients && trueFilters.clients.length ?
      {
        $in: trueFilters.clients
      } : { $exists: true },
    dataoperation: trueFilters.dateRange ?
      {
        $gte: new Date(trueFilters.dateRange[0]).setHours(0, 0, 0, 0),
        $lt: new Date(trueFilters.dateRange[1]).setHours(23, 59, 0, 0),
      } : { $exists: true },
    ...(mp === 'all' ? {} : { mp: mp }),
    ...trueType
  }
  ).limit(500000)

  if (!dataCount) throw new Error('Нет данных')

  for (let i = 0; i < Math.ceil(dataCount / limit); i++) {
    let foundData: any = []
    try {
      if (trueFilters.type == 'any') {

        foundData = await getAll(
          trueFilters,
          mp,
          limit * i,
          limit,
        )


      } else if (trueFilters.type == 'allBuyouts') {

        foundData = await getAllBuyouts(
          trueFilters,
          mp,
          limit * i,
          limit,
        )

      } else if (trueFilters.type == 'buyouts service') {
        foundData = await getBuyoutsService(
          trueFilters,
          mp,
          limit * i,
          limit,
        )
      } else if (trueFilters.type == 'buyouts') {

        foundData = await getBuyouts(
          trueFilters,
          mp,
          limit * i,
          limit,
        )

      } else {
        foundData = await getCommonData(
          trueFilters,
          mp,
          limit * i,
          limit
        )
      }

      if (foundData && foundData.length > 0) allData.push(...foundData)

    }
    catch (error) {

    }
  }




  const sheet = workbook.addWorksheet('Отчет о платежах', {
    headerFooter: { firstHeader: `Всего: ${dataCount}` },
  })

  const columns = [
    { header: 'ID', key: '_id', width: 48, font: { bold: true } },
    { header: 'userId', key: 'userUuid', width: 40, font: { bold: true } },
    { header: 'email', key: 'email', width: 30, font: { bold: true } },
    { header: 'username', key: 'username', width: 20, font: { bold: true } },
    // { header: 'telegram', key: 'telegram', width: 20, font: { bold: true } },
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
      header: 'услуга',
      key: 'serviceName',
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
      header: 'комментарий',
      key: 'comment',
      width: 58,
      font: { bold: true },
    },
    {
      header: 'Дата операции',
      key: 'dataoperation',
      width: 16,
      font: { bold: true },
    },
  ]



  if (trueFilters.type == 'buyouts' || trueFilters.type == 'any' || trueFilters.type == 'allBuyouts') {
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

  sheet.addRows(allData.sort((a: any, b: any) => b.dataoperation - a.dataoperation))

  await ActionHistory.create({
    adminUser: user._id,
    actionId: 32,
    actionDescription: `Экспорт в эксель`,
    date: new Date(),
  })

  const buffer = await workbook.xlsx.writeBuffer()
  return buffer
})
