import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { TariffPayment } from '@/server/lib/models/TariffPayment'
const limit = 50

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session) return sendRedirect(event, '/auth', 302)

  const user = await AdminUser.findOne({ uuid: session.uuid })

  if (!user || (!user.mainAdmin && !user.tabs.includes('тарифные планы')))
    return sendRedirect(event, '/auth', 302)

  const { dateRange, mp, searchQuery, page }: any = getQuery(event)

  let foundUsers: any = []
  if (searchQuery) {
    foundUsers = await User.find({
      $or: [
        { username: { $regex: searchQuery, $options: 'i' } },
        { orgName: { $regex: searchQuery, $options: 'i' } },
      ],
    })
  }

  const payments = await TariffPayment.find({
    status: 'created',
    user: searchQuery
      ? { $in: foundUsers.map((user: any) => user._id) }
      : { $exists: true },
    mp: mp === 'all' ? { $exists: true } : mp,
    createdAt: dateRange
      ? {
          $gte: new Date(JSON.parse(dateRange[0])),
          $lte: new Date(JSON.parse(dateRange[1])),
        }
      : { $exists: true },
  })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)

  if (!searchQuery) {
    foundUsers = await User.find({
      _id: { $in: payments.map((el: any) => el.user) },
    })
  }

  const format = payments.map((el: any) => {
    const user = foundUsers.find(
      (user: any) => user._id.valueOf() == el.user.valueOf()
    )
    return {
      id: user.uuid,
      uuid: el.uuid,
      username: user.username,
      orgName: user.orgName,
      email: user.email,
      phone: user.phoneNumber,
      mp: el.mp,
      price: el.price,
      paket: el.tariff + ' ' + el.type,
      createdAt: el.createdAt,
      status: el.status,
    }
  })
  
  return format
})
