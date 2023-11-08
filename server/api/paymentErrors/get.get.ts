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
  if (!user || (!user.mainAdmin && !user.tabs.includes('ошибки финаносвых операции')))
    return sendRedirect(event, '/auth', 302)

  const { page, account, sortDate, dateRange }: any =
    getQuery(event)

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
    ...accountOperation,
    ...trueDateRange,
  })
    .sort({requestDate: sortDate})
    .limit(elPerPage)
    .skip((page - 1) * elPerPage)

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
