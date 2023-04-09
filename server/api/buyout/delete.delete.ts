import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { Buyout } from '@/server/lib/models/Buyout'
import { Delivery } from '@/server/lib/models/Delivery'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  const body = await readBody(event)
  if (!session)
    return sendRedirect(event, '/auth', 302)

  const user = await User.findOne({ uuid: session.uuid })

  if (!user)
    return sendRedirect(event, '/auth', 302)

  const found = await Buyout.findOne({ uuid: body.uuid })

  if (
    found?.orderPaymentStatus !== 'Не оплачен'
		|| found?.servicePaymentStatus !== 'Не оплачен'
  ) {
    throw createError({
      statusCode: 400,
      message: 'Нельзя удалить заказ, который оплачен',
    })
  }
  const delivery = await Delivery.findOne({ idbuyout: found._id })
  if (delivery) {
    throw createError({
      statusCode: 400,
      message: 'Нельзя удалить заказ, который оплачен',
    })
  }

  const deleted = await Buyout.deleteOne({ uuid: body.uuid })
  console.log(deleted)
  if (deleted) {
    return {
      status: 'ok',
    }
  }
  throw createError({
    statusCode: 500,
    message: 'Не удалось удалить заказ',
  })
})
