import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { ActionHistory } from '~/server/lib/models/actionHistory'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { RefundRequest } from '~/server/lib/models/RefundRequest'

const runtimeConfig = useRuntimeConfig()
let paymentPerPage = 50
let elPerPage = 50

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)
  const user = await AdminUser.findOne({ uuid: session.uuid })
  if (
    !user ||
    (!user.mainAdmin && !user.tabs.includes('возвраты средств клиентам'))
  )
    return sendRedirect(event, '/auth', 302)

  const allowedUsersParam = user.isAllUsersAllowed
    ? {
        user: { $nin: user.restrictedUsers.map((id: any) => id) },
      }
    : {
        $and: [
          { user: { $in: user.allowedUsers.map((id: any) => id) } },
          { user: { $nin: user.restrictedUsers.map((id: any) => id) } },
        ],
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

  const requests = await RefundRequest.find({
    mp: 'ozon',
    ...allowedUsersParam,
    ...trueDateRange,
  })
    .sort({ requestDate: Number(sortDate) === -1 ? -1 : 1 })
    .limit(elPerPage)
    .skip((page - 1) * elPerPage)
    .lean()

  const adminIds = requests.map((req: any) => req.adminUser)
  const userIds = requests.map((req: any) => req.user)
  const admins = await AdminUser.find({
    _id: { $in: adminIds },
  })
  const users = await User.find({
    _id: { $in: userIds },
  })

  await ActionHistory.create({
    adminUser: user._id,
    actionId: 91,
    actionDescription: `Получение запросов возврата средств`,
    date: new Date(),
  })

  const format = requests.map((req: any) => {
    const admin = admins.find(
      (admin: any) => admin._id.valueOf() === req.adminUser.valueOf()
    )
    const user = users.find(
      (user: any) => user._id.valueOf() === req.user.valueOf()
    )
    return {
      ...req,
      adminUsername: admin?.username,
      userUsername: user?.username,
    }
  })

  return format
})
