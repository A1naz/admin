import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { paymenthistory } from '~/server/lib/models/Paymenthistory'
import { Buyout } from '~/server/lib/models/Buyout'
import { PartnerWithdraw } from '~/server/lib/models/PartnerWithdraw'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session) return sendRedirect(event, '/auth', 302)
  const user = await User.findOne({ uuid: session.uuid })
  if (!user) return sendRedirect(event, '/auth', 302)

  let withdrawsCount = 0
  const aggregate = await PartnerWithdraw.aggregate([
    {
      $match: {
        status: { $in: ['created', 'work', 'completed'] },
        user: user._id,
      },
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' }, // Вычисляем сумму 'amount' в каждой группе
      },
    },
  ])

  if (aggregate && aggregate.length > 0) {
    withdrawsCount = aggregate[0].totalAmount
  }

  return { withdrawsCount }
})
