import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { paymenthistory } from '~/server/lib/models/Paymenthistory'
import { Buyout } from '~/server/lib/models/Buyout'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session) return sendRedirect(event, '/auth', 302)
  const user = await User.findOne({ uuid: session.uuid })
  if (!user) return sendRedirect(event, '/auth', 302)

  const advertisementRules = [8, 9]
  const allBuyouts = await Buyout.find({ user })
  const advertBuyoutsCount = await Buyout.countDocuments({
    user,
    rules: { $in: advertisementRules },
  })

  return { all: allBuyouts.length, inAdvertisement: advertBuyoutsCount }
})
