import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { Cart } from '~~/server/lib/models/Cart'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session)
    return sendRedirect(event, '/auth', 302)

  const user = await User.findOne({ uuid: session.uuid })
  if (!user)
    return sendRedirect(event, '/auth', 302)
  const carts = await Cart.find({ user })
  const format = carts.map((cart, index) => {
    return {
      place: index + 1,
      name: cart.name,
      status: cart.status,
      article: cart.article,
      amount: cart.amount,
      image: cart.image,
      size: cart.size,
      query: cart.query,
      createdDate: cart.createdDate,
      endedDate: cart.endedDate || null,
    }
  })
  return format
})
