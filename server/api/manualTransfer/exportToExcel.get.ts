import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { ActionHistory } from '~/server/lib/models/actionHistory'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { manualBalanceTransferRequest } from '~/server/lib/models/manualBalanceTransferRequest'
import ExcelJS from 'exceljs'

const runtimeConfig = useRuntimeConfig()
let paymentPerPage = 50
let elPerPage = 50

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)
  const user = await AdminUser.findOne({ uuid: session.uuid })
  if (
    !user ||
    (!user.mainAdmin && !user.tabs.includes('ручные пополнения средств'))
  ) {
    return sendRedirect(event, '/auth', 302)
  }



  const requests = await manualBalanceTransferRequest
    .find()
    .limit(50000)
    .lean()

  await ActionHistory.create({
    adminUser: user._id,
    actionId: 84,
    actionDescription: `Экспорт ручных пополнений средств в Excel`,
    date: new Date(),
  })

  const userIds = requests.map((req: any) => req.user)

  const users = await User.find({
    _id: { $in: userIds },
  })

  const format = requests.map((req: any) => {
    const user = users.find((u: any) => u._id.valueOf() === req.user.valueOf())
    return {
      ...req,
      username: user?.username,
      organization: user?.fizFace
        ? user?.username + '(Физ. лицо)'
        : user?.orgName,
    }
  }).sort((a: any, b: any) => b.createdAt - a.createdAt)

  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Ручные пополнения')

  sheet.columns = [
    { header: 'Организация', key: 'organization', width: 20 },
    { header: 'Логин', key: 'login', width: 20 },
    { header: 'Дата и время', key: 'dateTime', width: 20 },
    { header: 'Сумма', key: 'summ', width: 15 },
    { header: 'Дата пополнения', key: 'operationDate', width: 20 },
    { header: 'Комиссия платформы', key: 'commission', width: 20 },
  ]

  format.forEach((transfer: any) => {
    sheet.addRow({
      organization: transfer.organization,
      login: transfer.username,
      dateTime: transfer.createdAt,
      summ: transfer.summ,
      operationDate: transfer.operationDate,
      commission: (transfer.summ * 5) / 105,
    })
  })

  const buffer = await workbook.xlsx.writeBuffer()

  event.res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  )

  return buffer
})
