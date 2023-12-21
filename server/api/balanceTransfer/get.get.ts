import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { ActionHistory } from '~/server/lib/models/actionHistory'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { balanceTransferRequest } from '~/server/lib/models/balanceTransferRequest'

const runtimeConfig = useRuntimeConfig()
let paymentPerPage = 50
let elPerPage = 50

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)
  const user = await AdminUser.findOne({ uuid: session.uuid })
  if (
    !user ||
    (!user.mainAdmin && !user.tabs.includes('переводы с аккаунта на аккаунт'))
  )
    return sendRedirect(event, '/auth', 302)

  const allowedUsersParam = user.isAllUsersAllowed
    ? {}
    : {
        sender: { $in: user.allowedUsers.map((id: any) => id) },
        recipient: { $in: user.allowedUsers.map((id: any) => id) },
      }

  const { page, sortDate, dateRange }: any = getQuery(event)

  let trueDateRange = {}
  if (dateRange) {
    trueDateRange = {
      requestDate: {
        $gte: new Date(JSON.parse(dateRange[0])).setHours(0, 0, 0, 0),
        $lt: new Date(JSON.parse(dateRange[1])).setHours(23, 59, 0, 0),
      },
    }
  }

  // const accountOperation =
  //   account.length > 5
  //     ? {
  //         account: {
  //           $regex: account.includes('+')
  //             ? account.replaceAll('+', '\\+')
  //             : account,
  //           $options: 'i',
  //         },
  //       }
  //     : {}

  const format = await balanceTransferRequest
    .find({
      // ...accountOperation,
      ...allowedUsersParam,
      ...trueDateRange,
    })
    .sort({ requestDate: Number(sortDate) === -1 ? -1 : 1 })
    .limit(elPerPage)
    .skip((page - 1) * elPerPage)
    .lean()

  await ActionHistory.create({
    adminUser: user._id,
    actionId: 81,
    actionDescription: `Получение запросов перевода на баланс`,
    date: new Date(),
  })

  return {
    balanceTransferRequest: format,
  }
})
