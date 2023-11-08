import { TransactionRequest } from '~/server/lib/models/TransactionRequest'
import { getServerSession } from '#auth'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { ScreenshotsRequire } from '~/server/lib/models/ScreenshotsRequire'
import { ActionHistory } from '~/server/lib/models/actionHistory'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  const { transaction, transactionNumber, client, screenshot } = await readBody(
    event
  )

  if (!session) return sendRedirect(event, '/auth', 302)

  const user = await AdminUser.findOne({ uuid: session.uuid })
  if (
    !user ||
    (!user.mainAdmin && !user.tabs.includes('ошибки финаносвых операции'))
  )
    return sendRedirect(event, '/auth', 302)

  const isTransactionExist = await TransactionRequest.findOne({
    transactionNumber,
    status: {
        $in: ['created', 'active']
    },
  })

  if (isTransactionExist) {
    return {
      status: 'error',
      message: 'Такая транзакция уже создана',
    }
  }

  const newTransactionRequest = await TransactionRequest.create({
    adminUser: user._id,
    transaction,
    transactionNumber,
    client,
    screenshot,
  })

  await ActionHistory.create({
    adminUser: user._id,
    actionId: 72,
    actionDescription: `Админ ${user.uuid} - ${user.username} создал запрос транзакции ${transactionNumber}`,
    date: new Date(),
  })

  return {
    status: 'ok',
    message: 'Запрос успешно создан',
  }
})
