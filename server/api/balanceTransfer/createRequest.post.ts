import { balanceTransferRequest } from '~/server/lib/models/balanceTransferRequest'
import { getServerSession } from '#auth'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { ActionHistory } from '~/server/lib/models/actionHistory'
import { User } from '~/server/lib/models/User'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  const { sender, recipient, screenshot, summ } = await readBody(event)

  if (sender === recipient) {
    return {
      status: 'error',
      message: 'Отправитель и получатель не могут быть одинаковыми',
    }
  }

  if (!session) return sendRedirect(event, '/auth', 302)

  const user = await AdminUser.findOne({ uuid: session.uuid })
  if (
    !user ||
    (!user.mainAdmin && !user.tabs.includes('переводы с аккаунта на аккаунт'))
  )
    return sendRedirect(event, '/auth', 302)

  const senderUser = await User.findById(sender)
  if (!senderUser) {
    return {
      status: 'error',
      message: 'Отправитель не найден',
    }
  }
  const recipientUser = await User.findById(recipient)
  if (!recipientUser) {
    return {
      status: 'error',
      message: 'Получатель не найден',
    }
  }

  const mskDate = new Date()
  mskDate.setHours(mskDate.getHours() + 3)

  if (senderUser.balance < Number(summ)) {
    return {
      status: 'error',
      message: 'Недостаточно средств на аккаунте',
    }
  }

  const newTransactionRequest = await balanceTransferRequest.create({
    adminUser: user._id,
    adminUserUuid: user.uuid,
    adminUserUsername: user.username,
    sender,
    senderUUID: senderUser.uuid,
    senderUsername: senderUser.username,
    recipient,
    recipientUUID: recipientUser.uuid,
    recipientUsername: recipientUser.username,
    summ,
    screenshot,
    acception: '0/2',
    requestDate: mskDate,
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
