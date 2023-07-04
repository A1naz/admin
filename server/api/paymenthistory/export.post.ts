import ExcelJS from 'exceljs'
import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { paymenthistory } from '~~/server/lib/models/Paymenthistory'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session)
    return sendRedirect(event, '/auth', 302)
  const user = await User.findOne({ uuid: session.uuid })
  if (!user)
    return sendRedirect(event, '/auth', 302)
  const { exportDates } = await readBody(event)

  const startDate = new Date(exportDates[0])
  const endDate = new Date(exportDates[1])
  const history = await paymenthistory.find({
    user,
    dataoperation: {
      $gt: startDate,
      $lt: endDate,
    },
  }).sort({ _id: -1 })
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Готовы к выдаче', {
    headerFooter: { firstHeader: `Всего записей: ${history.length}` },
  })

  sheet.columns = [
    { header: 'Сумма', key: 'summ', font: { bold: true } },
    { header: 'Тип операции', key: 'typeoperations', width: 16, font: { bold: true } },
    { header: 'Основание операции', key: 'basisoperation', width: 32, font: { bold: true } },
    { header: 'Дата', key: 'dataoperation', width: 16, font: { bold: true } },
    { header: 'Комментарий', key: 'comment', width: 16, font: { bold: true } },

  ]
  sheet.addRows(history)
  const buffer = await workbook.xlsx.writeBuffer()
  return buffer
})
