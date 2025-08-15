import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { ActionHistory } from '~/server/lib/models/actionHistory'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { manualBalanceTransferRequest } from '~/server/lib/models/manualBalanceTransferRequest'

const runtimeConfig = useRuntimeConfig()
let paymentPerPage = 50
let elPerPage = 50

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)
  const user = await AdminUser.findOne({ uuid: session.uuid })
  if (
    !user ||
    (!user.mainAdmin && !user.tabs.includes('ручные пополнения средств'))
  ) {
    return sendRedirect(event, '/auth', 302)
  }

  // const allowedUsersParam = user.isAllUsersAllowed
  // ? {
  //     sender: { $nin: user.restrictedUsers.map((id: any) => id) },
  //     recipient: { $nin: user.restrictedUsers.map((id: any) => id) },
  //   }
  // : {
  //     $and: [
  //       {
  //         sender: { $in: user.allowedUsers.map((id: any) => id) },
  //         recipient: { $in: user.allowedUsers.map((id: any) => id) },
  //       },
  //       {
  //         sender: { $nin: user.restrictedUsers.map((id: any) => id) },
  //         recipient: { $nin: user.restrictedUsers.map((id: any) => id) },
  //       },
  //     ],
  //   }

  const { page, sortDate, dateRange, searchQuery }: any = getQuery(event)

  let trueDateRange = {}
  if (dateRange) {
    trueDateRange = {
      createdAt: {
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

  let foundUsers: any[] = []
  if (searchQuery && searchQuery.length > 0) {
    foundUsers = await User.find({
      $or: [
        { username: { $regex: searchQuery, $options: 'i' } },
        { orgName: { $regex: searchQuery, $options: 'i' } },
      ],
    })
  }

  const filter: any = {
    ...(foundUsers.length > 0 && {
      user: { $in: foundUsers.map((u) => u._id) },
    }),
    ...trueDateRange,
  }

  // Проверяем, что searchQuery — число
  if (searchQuery && !isNaN(Number(searchQuery))) {
    filter.summ = Number(searchQuery)
  }

  const requests = await manualBalanceTransferRequest
    .find(filter)
    .sort({ createdAt: Number(sortDate) === -1 ? -1 : 1 })
    .limit(elPerPage)
    .skip((page - 1) * elPerPage)
    .lean()

  await ActionHistory.create({
    adminUser: user._id,
    actionId: 81,
    actionDescription: `Получение запросов перевода на баланс`,
    date: new Date(),
  })

  const userIds = requests.map((req: any) => req.user)

  const users = await User.find({
    _id: { $in: userIds },
  })

  const format = requests.map((req: any) => {
    const user = users.find((u: any) => u._id.valueOf() === req.user.valueOf())
    return {
      ...req,
      username: user?.username,
      organization: user?.fizFace
        ? user?.username + '(Физ. лицо)'
        : user?.orgName,
    }
  })

  return {
    balanceTransferRequest: format,
  }
})
