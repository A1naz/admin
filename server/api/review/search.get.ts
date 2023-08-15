import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { Delivery } from '@/server/lib/models/Delivery'
import { Buyout } from '@/server/lib/models/Buyout'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  const { type, string } = getQuery(event)

  if (!session)
    return sendRedirect(event, '/auth', 302)

  const user = await User.findOne({ uuid: session.uuid })
  if (!user)
    return sendRedirect(event, '/auth', 302)

  let readyForReview

  if (type === 'article') {
    readyForReview = await Delivery.find({
      user,
      status: 'completed',
      reviewed: false,
      $text: { $search: string?.toString() },
    }).sort({
      createdAt: -1,
    })
  }
  else if (type === 'uuid') {
    const uuid = string?.toString().replaceAll('#', '')
    readyForReview = await Delivery.find({
      user,
      status: 'completed',
      reviewed: false,
      uuidbuyout: uuid,
    }).sort({
      createdAt: -1,
    })
  }

  if (!readyForReview)
    return []

  const format = await Promise.all(
    readyForReview.map(async (delivery) => {
      const buyout = await Buyout.findOne({ _id: delivery.idbuyout })
      if (!buyout)
        return undefined
      return {
        buyoutuuid: buyout.uuid,
        sex: buyout.gender,
        article: delivery.article,
        pricebuy: delivery.pricebuy,
        size: buyout.sizeparam,
        productname: buyout.product.name,
        productimage: buyout.product.image,
        updatedAt: delivery.updatedAt,
        id: delivery._id,
      }
    }),
  )
  return format.filter(item => item !== undefined)
})
