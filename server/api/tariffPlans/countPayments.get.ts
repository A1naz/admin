import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { AdminUser } from '~/server/lib/models/AdminUser'
import { TariffPlan } from '~/server/lib/models/TariffPlan'
import { paymenthistory } from '~/server/lib/models/Paymenthistory'
import { skip } from 'node:test'

export default eventHandler(async (event) => {
  const payments: any = {
    buyouts: 0,
    review: 0,
    likeReview: 0,
    likeProduct: 0,
    cart: 0,
    questionProduct: 0,
    deliveryStorage: 0,
    reviewRemoving: 0,
  }

  const session = (await getServerSession(event)) as any

  if (!session) return sendRedirect(event, '/auth', 302)

  const user = await AdminUser.findOne({ uuid: session.uuid })
  if (!user || (!user.mainAdmin && !user.tabs.includes('тарифные планы')))
    return sendRedirect(event, '/auth', 302)

  const { uuid } = getQuery(event)

  const foundPlan = await TariffPlan.findOne({ uuid })
  if (!foundPlan) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Тарифные планы не найдены',
    })
  }

  const foundPayments: any = await paymenthistory.find({
    user: foundPlan.user,
    mp: foundPlan.mp === 'all' ? { $exists: true } : foundPlan.mp,
    dataoperation: {
      $gte: new Date(foundPlan.activationDate).setHours(0, 0, 0, 0),
      $lt: new Date(foundPlan.endDate).setHours(23, 59, 0, 0),
    },
  })

  if (!foundPayments || !foundPayments.length) {
    return payments
  }

  for (const payment of foundPayments) {
    if (payment.type !== 'deposit' && payment.type !== 'buyouts service') {
      payments[payment.type] += 1
    }
  }

  return payments
})
