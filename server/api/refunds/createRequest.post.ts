import { RefundRequest } from '~/server/lib/models/RefundRequest'
import { getServerSession } from '#auth'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { ActionHistory } from '~/server/lib/models/actionHistory'
import { User } from '~/server/lib/models/User'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  const {
    userId,
    screenshot,
    mainOperation,
    paymentOperations,
    mainOperationSumm,
    selectedPaymentOperationsSumm,
    comment,
    handleOperationSumm,
    accountScreenshot,
    refundType,
    phoneNumber,
    mainOperationType,
  } = await readBody(event)

  if (!comment) {
    return {
      status: 400,
      message: 'Комментарий не может быть пустым',
    }
  }

  if (!session) return sendRedirect(event, '/auth', 302)
  const user = await AdminUser.findOne({ uuid: session.uuid })
  if (
    !user ||
    (!user.mainAdmin && !user.tabs.includes('возвраты средств клиентам'))
  )
    return sendRedirect(event, '/auth', 302)

  const newRequest = await RefundRequest.create({
    adminUser: user._id,
    adminUserUuid: user.uuid,
    user: userId,
    screenshot,
    mainOperation,
    selectedPaymentOperations: paymentOperations,
    comment,
    mainOperationSumm,
    selectedPaymentOperationsSumm: selectedPaymentOperationsSumm,
    handleOperationSumm,
    accountScreenshot: accountScreenshot,
    refundType,
    phoneNumber,
    mainOperationType,
  })

  await ActionHistory.create({
    adminUser: user._id,
    actionId: 92,
    actionDescription: `Админ ${user.uuid} - ${user.username} создал запрос возврата средств ${newRequest._id}`,
    date: new Date(),
  })

  return {
    status: 'ok',
    message: 'Запрос успешно создан',
  }
})
