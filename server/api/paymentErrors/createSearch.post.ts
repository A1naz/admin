import { getServerSession } from '#auth'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { ScreenshotsRequire } from '~/server/lib/models/ScreenshotsRequire'
import { ActionHistory } from '~/server/lib/models/actionHistory'
import { TransactionSearch } from '~/server/lib/models/TransactionSearch'
import { User } from '~/server/lib/models/User'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  const { transaction, date, client, phoneNumber } = await readBody(event)

  if (!session) return sendRedirect(event, '/auth', 302)

  const user = await AdminUser.findOne({ uuid: session.uuid })
  if (
    !user ||
    (!user.mainAdmin && !user.tabs.includes('ошибки финаносвых операции'))
  )
    return sendRedirect(event, '/auth', 302)

  const userForReq = await User.findById(client)

  if (!userForReq) {
    return {
      status: 'error',
      message: 'Пользователь не найден',
    }
  }

  const newTransactionSearch = await TransactionSearch.create({
    adminUser: user._id,
    client: userForReq._id,
    sum: Number(transaction),
    phoneNumber,
    transactionDate: new Date(date),
  })

  await ActionHistory.create({
    adminUser: user._id,
    actionId: 73,
    actionDescription: `Админ ${user.uuid} - ${user.username} начал поиск транзакции ${transaction}`,
    date: new Date(),
  })

  return {
    status: 'ok',
    id: newTransactionSearch._id,
  }
})
