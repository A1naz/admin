import { manualBalanceTransferRequest } from '~/server/lib/models/manualBalanceTransferRequest'
import { getServerSession } from '#auth'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { ActionHistory } from '~/server/lib/models/actionHistory'
import { User } from '~/server/lib/models/User'

function formatDate(date: Date) {
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()

  const formattedDay = String(day).padStart(2, '0')
  const formattedMonth = String(month).padStart(2, '0')

  const formattedDate = `${formattedDay}.${formattedMonth}.${year}`

  return formattedDate
}

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  const {
    userId,
    operationNumber,
    screenshot,
    summ,
    operationDate,
    clientPC,
    bank,
    userIP,
    repaymentType,
  } = await readBody(event)

  if (!session) return sendRedirect(event, '/auth', 302)

  const user = await AdminUser.findOne({ uuid: session.uuid })
  if (
    !user ||
    (!user.mainAdmin && !user.tabs.includes('ручные пополнения средств'))
  ) {
    return sendRedirect(event, '/auth', 302)
  }

  const recipientUser = await User.findById(userId)
  if (!recipientUser) {
    return {
      status: 'error',
      message: 'Получатель не найден',
    }
  }

  const mskDate = new Date()
  mskDate.setHours(mskDate.getHours() + 3)
  const strDate = formatDate(new Date(operationDate))

  const newTransactionRequest = await manualBalanceTransferRequest.create({
    user: recipientUser._id,
    userUuid: recipientUser.uuid,
    operationNumber,
    summ:
      repaymentType === 'WithNDS5'
        ? summ * 0.95
        : repaymentType == 'WithNDS7'
        ? summ * 0.93
        : summ,
    type: repaymentType,
    screenshot,
    acception: '0/2',
    createdAt: mskDate,
    operationDate: strDate,
    fullDate: mskDate,
    clientPC,
    bank: repaymentType == 'refund' ? '' : bank,
    userIP: repaymentType == 'refund' ? '' : bank,
  })

  await ActionHistory.create({
    adminUser: user._id,
    actionId: 82,
    actionDescription: `Админ ${user.uuid} - ${user.username} создал запрос перевода ${newTransactionRequest._id}`,
    date: new Date(),
  })

  return {
    status: 'ok',
    message: 'Запрос успешно создан',
  }
})
