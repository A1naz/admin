import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { PaymentIntend } from '~/server/lib/models/PaymentIntend'
const limit = 50

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session) return sendRedirect(event, '/auth', 302)

  const user = await AdminUser.findOne({ uuid: session.uuid })

  if (!user || (!user.mainAdmin && !user.tabs.includes('продажи')))
    return sendRedirect(event, '/auth', 302)

  const { dateRange, searchQuery, page }: any = getQuery(event)

  let users = searchQuery
    ? await User.find({
        $or: [
          { username: { $regex: searchQuery, $options: 'i' } },
          { orgName: { $regex: searchQuery, $options: 'i' } },
        ],
      }).limit(30)
    : []

  const payments = await PaymentIntend.find({
    user: users.length
      ? { $in: users.map((user: any) => user._id) }
      : { $exists: true },
    dataoperation:
      dateRange && dateRange[0] && dateRange[1]
        ? {
            $gte: new Date(JSON.parse(dateRange[0])).setHours(0, 0, 0, 0),
            $lt: new Date(JSON.parse(dateRange[1])).setHours(23, 59, 0, 0),
          }
        : { $exists: true },
    // typeoperations: 'product',
  })
    .limit(limit)
    .skip((page - 1) * limit)

  if (!payments || !payments.length) {
    return []
  }

  if (!users.length)
    users = await User.find({
      _id: { $in: payments.map((payment: any) => payment.user) },
    })

  const format = payments.map((el: any) => {
    const user: any = users.find(
      (user: any) => user._id.valueOf() == el.user.valueOf()
    )

    return {
      userUuid: user.uuid,
      username: user.username,
      orgName: user.orgName,
      FIO: user.firstName + ' ' + user.middleName + ' ' + user.lastName,
      email: user.email,
      phone: user.phoneNumber,
      summ: el.summ,
      date: el.dataoperation,
      status: el.status || 'Не оплачено',
      orgInn: user.orgInn,
      registrationDate: user.registrationDate,
      orgOgrn: user.orgOgrn,
    }
  })

  return format
})
