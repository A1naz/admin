﻿import { TransactionRequest } from '~/server/lib/models/TransactionRequest'
import { getServerSession } from '#auth'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { ScreenshotsRequire } from '~/server/lib/models/ScreenshotsRequire'
import { ActionHistory } from '~/server/lib/models/actionHistory'
import { User } from '~/server/lib/models/User'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  const {
    transaction,
    transactionNumber,
    client,
    screenshot,
    date,
    phoneNumber,
  } = await readBody(event)

  if (!session) return sendRedirect(event, '/auth', 302)

  const user = await AdminUser.findOne({ uuid: session.uuid })
  if (
    !user ||
    (!user.mainAdmin && !user.tabs.includes('ошибки финансовых операции'))
  )
    return sendRedirect(event, '/auth', 302)

  const curDate = new Date()
  const dateToFilter = curDate.setHours(curDate.getHours() - 72)

  const isTransactionExist = await TransactionRequest.findOne({
    transactionNumber,
    $or: [
      {
        status: {
          $in: ['created', 'active'],
        },
      },
      {
        status: 'accepted',
        acception: {
          $in: ['0/2', '1/2'],
        },
        requestDate: {
          $gte: dateToFilter,
        },
      },
      {
        status: {
          $in: ['accepted'],
        },
        acception: {
          $in: ['2/2'],
        },
      },
    ],
  })

  if (isTransactionExist) {
    return {
      status: 'error',
      message: 'Такая транзакция уже создана',
    }
  }

  const userForReq = await User.findById(client)

  if (!userForReq) {
    return {
      status: 'error',
      message: 'Пользователь не найден',
    }
  }

  if (phoneNumber.length < 11) {
    return {
      status: 'error',
      message: 'Некорректный номер телефона',
    }
  }

  const mskDate = new Date()
  mskDate.setHours(mskDate.getHours() + 3)
  const newTransactionRequest = await TransactionRequest.create({
    adminUser: user._id,
    client: userForReq._id,
    adminUserUuid: user.uuid,
    clientUuid: userForReq.uuid,
    summ: Number(transaction),
    transactionNumber,
    screenshot,
    phoneNumber: phoneNumber,
    transactionDate: new Date(date),
    requestDate: mskDate,
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
