import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { paymenthistory } from '~/server/lib/models/Paymenthistory'
import { Buyout } from '~/server/lib/models/Buyout'
import { Delivery } from '~/server/lib/models/Delivery'

function daysToPenalty(statusdelivery: any[]) {
  const item = statusdelivery.find((item) => item.status === 'Готов к выдаче')
  if (!item) return 0

  const updatedAt = new Date(item.date)
  const penaltyDay = new Date(updatedAt.getTime() + 5 * 24 * 60 * 60 * 1000)
  const now = new Date()
  const timeLeft = penaltyDay.getTime() - now.getTime()
  // eslint-disable-next-line max-statements-per-line
  if (timeLeft < 0) {
    return 1
  } else {
    return 0
  }
}

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)
  const user = await User.findOne({ uuid: session.uuid })
  if (!user) return sendRedirect(event, '/auth', 302)

  const allDeliveriesCount = await Delivery.countDocuments({ user })

  const availableDeliveriesCount = await Delivery.countDocuments({
    user,
    status: 'active',
    statusdelivery: { $elemMatch: { status: 'Готов к выдаче' } },
  })

  const completedDeliveriesCount = await Delivery.countDocuments({
    user,
    status: 'completed',
    statusdelivery: { $elemMatch: { status: 'Получено' } },
  })

  const penaltyDeliveriesPayments = await paymenthistory.find({
    user,
    typeoperations: 'Расход',
    type: 'deliveries',
    comment: { $regex: 'Штраф', $options: 'i' },
  })

  let penaltyDeliveriesSumm = 0
  penaltyDeliveriesPayments.forEach((item) => {
    penaltyDeliveriesSumm += +item.summ
  })

  const deliveriesPenaltyCount = await Delivery.countDocuments({
    user,
    $and: [{ data9: { $ne: null } }, { data9: { $ne: '' } }],
  })

  const availableDeliveries = await Delivery.find({
    user,
    status: 'active',
    statusdelivery: { $elemMatch: { status: 'Готов к выдаче' } },
  })
  let actualPenaltyDeliveriesCount = 0

  availableDeliveries.forEach((item) => {
    actualPenaltyDeliveriesCount += daysToPenalty(item.statusdelivery)
  })

  return {
    all: allDeliveriesCount,
    active: availableDeliveriesCount,
    completed: completedDeliveriesCount,
    penalty: penaltyDeliveriesSumm,
    penaltyCount: deliveriesPenaltyCount,
    availableWithPenaltyCount: actualPenaltyDeliveriesCount,
  }
})
