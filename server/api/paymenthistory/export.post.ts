import ExcelJS from 'exceljs'
import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { paymenthistory } from '~~/server/lib/models/Paymenthistory'

function getHistoryType(type: string) {
  let result = ''
  switch (type) {
    case 'buyouts':
      result = 'Выкуп'
      break
    case 'reviews':
      result = 'Отзыв'
      break
    case 'likes':
      result = 'Лайк'
      break
    case 'productlikes':
      result = 'Лайк на товар / бренд'
      break
    case 'carts':
      result = 'Добавление в корзину'
      break
    case 'questions':
      result = 'Вопрос'
      break
  }
  return result
}
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
  const sheet = workbook.addWorksheet('История платежей', {
    headerFooter: { firstHeader: `Всего записей: ${history.length}` },
  })
  const mapped = history.map((item, index) => ({
    number: index + 1,
    summ: item.summ,
    typeoperations: item.typeoperations,
    type: getHistoryType(item.type || ''),
    article: item.article,
    basisoperation: item.basisoperation,
    dataoperation: item.dataoperation,
    comment: item.comment,
  }))
  sheet.columns = [
    { header: 'Номер', key: 'index', font: { bold: true } },
    { header: 'Сумма', key: 'summ', font: { bold: true } },
    { header: 'Тип операции', key: 'typeoperations', width: 16, font: { bold: true } },
    { header: 'Услуга', key: 'type', width: 16, font: { bold: true } },
    { header: 'Артикул', key: 'article', width: 16, font: { bold: true } },
    { header: 'Основание операции', key: 'basisoperation', width: 32, font: { bold: true } },
    { header: 'Дата', key: 'dataoperation', width: 16, font: { bold: true } },
    { header: 'Комментарий', key: 'comment', width: 16, font: { bold: true } },

  ]
  sheet.addRows(mapped)
  const buffer = await workbook.xlsx.writeBuffer()
  return buffer
})
