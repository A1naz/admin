import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { TariffPlan } from '~/server/lib/models/TariffPlan'
import { create } from 'domain'
const limit = 50

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session) return sendRedirect(event, '/auth', 302)

  const user = await AdminUser.findOne({ uuid: session.uuid })

  if (!user || (!user.mainAdmin && !user.tabs.includes('тарифные планы')))
    return sendRedirect(event, '/auth', 302)

  const { dateRange, mp, searchQuery, page }: any = getQuery(event)
  const dateRangeParam: Object = dateRange
    ? {
        activationDate: {
          $lte: new Date(JSON.parse(dateRange[0])),
        },
        endDate: {
          $gte: new Date(JSON.parse(dateRange[1])),
        },
      }
    : {}

  const searchQueryParam: Object = searchQuery
    ? {
        $or: [
          { username: { $regex: searchQuery, $options: 'i' } },
          { orgName: { $regex: searchQuery, $options: 'i' } },
        ],
      }
    : {}

  let users: any = []
  if (searchQuery) {
    users = await User.find({
      ...searchQueryParam,
    }).limit(50)
  }

  const allowedUsersParam: Object = user.isAllUsersAllowed
    ? {}
    : {
        user: { $in: user.allowedUsers.map((id: any) => id) },
      }

  const tariffs = await TariffPlan.find({
    ...allowedUsersParam,
    user: users.length
      ? { $in: users.map((item: any) => item._id) }
      : { $exists: true },
    ...dateRangeParam,
    mp: mp == 'all' ? { $exists: true } : mp,
  })
    .limit(limit)
    .skip((page - 1) * limit)
    .sort({ activationDate: -1 })

  users = await User.find({
    _id: { $in: tariffs.map((item: any) => item.user) },
  })

  const admins = await AdminUser.find({
    _id: { $in: tariffs.map((item: any) => item.adminUser) },
  })

  const format: any = tariffs.map((item: any) => {
    const user = users.find((user: any) => user._id.equals(item.user))
    const admin = admins.find((admin: any) => admin._id.equals(item.adminUser))

    return {
      adminName: admin ? admin.firstName + ' ' + admin.lastName : '',
      userFullName: user ? user.firstName + ' ' + user.lastName : '',
      adminUsername: admin ? admin.username : '',
      userUuid: user ? user.uuid : '',
      username: user ? user.username : '',
      userOrgName: user ? user.orgName : '',
      userEmail: user ? user.email : '',
      userPhone: user ? user.phoneNumber : '',
      createdAt: item.createdAt,
      mp: item.mp,
      tariff: item.tariff,
      type: item.type,
      timeLimitMonths: item.timeLimitMonths,
      status: item.status,
      endDate: item.endDate,
      paymentDate: item.paymentDate,
      activationDate: item.activationDate,
      uuid: item.uuid,
    }
  })

  return format
})
