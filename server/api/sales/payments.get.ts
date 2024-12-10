import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { PaymentIntend } from '~/server/lib/models/PaymentIntend'
import { ActionHistory } from '~/server/lib/models/actionHistory'
import he from 'he'

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

    if (!user) {
      return
    }

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
      registrationDate: user.registrationDate,
      orgOgrn: user.orgOgrn,
      orgInn: user.orgInn,
      rs: user.bankInfo ? user.bankInfo.rs : '',
      bik: user.bankInfo ? user.bankInfo.bik : '',
      ks: user.bankInfo ? user.bankInfo.ks : '',
      bankName: user.bankInfo ? he.decode(user.bankInfo.name) : '',
      namemini: user.bankInfo ? user.bankInfo.namemini : '',
      index: user.bankInfo ? user.bankInfo.index : '',
      city: user.bankInfo ? user.bankInfo.city : '',
      address: user.bankInfo
        ? user.bankInfo.city + ', ' + user.bankInfo.address
        : '',
      orgPhone: user.bankInfo ? user.bankInfo.phone : '',
    }
  }).filter((item: any) => item !== undefined && item !== null)

  await ActionHistory.create({
    adminUser: user._id,
    actionId: 82,
    actionDescription: `Админ ${user.uuid} - ${user.username} получил список платежей, вкладка Продажи`,
    date: new Date(),
  })

  return format
})
