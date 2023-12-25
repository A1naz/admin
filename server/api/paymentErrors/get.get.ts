import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { ActionHistory } from '~/server/lib/models/actionHistory'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { TransactionRequest } from '~/server/lib/models/TransactionRequest'
import { Buyout } from '~/server/lib/models/Buyout'

const runtimeConfig = useRuntimeConfig()
let paymentPerPage = 50
let elPerPage = 50

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)
  const user = await AdminUser.findOne({ uuid: session.uuid })
  if (
    !user ||
    (!user.mainAdmin && !user.tabs.includes('ошибки финансовых операции'))
  )
    return sendRedirect(event, '/auth', 302)

  const allowedUsersParam = user.isAllUsersAllowed
  ? {
      client: { $nin: user.restrictedUsers.map((id: any) => id) },
    }
  : {
      $and: [
        { client: { $in: user.allowedUsers.map((id: any) => id) } },
        { client: { $nin: user.restrictedUsers.map((id: any) => id) } },
      ],
    }

  const { page, account, sortDate, dateRange }: any = getQuery(event)

  let trueDateRange = {}
  if (dateRange) {
    trueDateRange = {
      requestDate: {
        $gte: new Date(JSON.parse(dateRange[0])).setHours(0, 0, 0, 0),
        $lt: new Date(JSON.parse(dateRange[1])).setHours(23, 59, 0, 0),
      },
    }
  }

  const accountOperation =
    account.length > 5
      ? {
          account: {
            $regex: account.includes('+')
              ? account.replaceAll('+', '\\+')
              : account,
            $options: 'i',
          },
        }
      : {}

  const format = await TransactionRequest.find({
    ...allowedUsersParam,
    ...accountOperation,
    ...trueDateRange,
  })
    .sort({ requestDate: Number(sortDate) === -1 ? -1 : 1 })
    .limit(elPerPage)
    .skip((page - 1) * elPerPage)
    .lean()

  const managerIds: Array<any> = format.map((el) => {
    return el.adminUser
  })

  const managers = await AdminUser.find({
    _id: { $in: managerIds },
  })

  format.forEach((el: any) => {
    el.managerUsername = managers.find((manager) => {
      return manager._id.valueOf() === el.adminUser.valueOf()
    })?.username
  })

  await ActionHistory.create({
    adminUser: user._id,
    actionId: 71,
    actionDescription: `Получение запросов транзакции`,
    date: new Date(),
  })

  return {
    transactionRequests: format,
  }
})
