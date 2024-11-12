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
  if (!user || !user.mainAdmin) return sendRedirect(event, '/auth', 302)

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

  const { page, sortDate, dateRange }: any = getQuery(event)

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

  const requests = await manualBalanceTransferRequest
    .find({
      // ...accountOperation,
      // ...allowedUsersParam,
      ...trueDateRange,
    })
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

  const users = await User.find(
    {
      _id: { $in: userIds },
    }
  )

  const format = requests.map((req: any) => {
    const user = users.find((u: any) => u._id.valueOf() === req.user.valueOf())
    return {
      ...req,
      username: user?.username,
      organization: user?.fizFace ? user?.username + '(Физ. лицо)' : user?.orgName,
    }
  })

  return {
    balanceTransferRequest: format,
  }
})
