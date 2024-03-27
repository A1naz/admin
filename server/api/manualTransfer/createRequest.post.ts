import { manualBalanceTransferRequest } from '~/server/lib/models/manualBalanceTransferRequest'
import { getServerSession } from '#auth'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { ActionHistory } from '~/server/lib/models/actionHistory'
import { User } from '~/server/lib/models/User'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  const { userId, operationNumber, screenshot, summ, operationDate, clientPC, bank } =
    await readBody(event)

  if (!session) return sendRedirect(event, '/auth', 302)

  const user = await AdminUser.findOne({ uuid: session.uuid })
  if (!user || !user.mainAdmin) return sendRedirect(event, '/auth', 302)

  const recipientUser = await User.findById(userId)
  if (!recipientUser) {
    return {
      status: 'error',
      message: 'Получатель не найден',
    }
  }

  const mskDate = new Date()
  mskDate.setHours(mskDate.getHours() + 3)

  const newTransactionRequest = await manualBalanceTransferRequest.create({
    user: recipientUser._id,
    userUuid: recipientUser.uuid,
    operationNumber,
    summ,
    screenshot,
    acception: '0/2',
    createdAt: mskDate,
    operationDate: operationDate,
    clientPC,
    bank
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
