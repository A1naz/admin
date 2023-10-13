import { Review } from '../models/Review'
import { User } from '../models/User'
import { Cart } from '../models/Cart'

export default async function getCarts(
  userId: string,
  status: string,
  page: any
) {
  const statusObj =
    status == 'any'
      ? {}
      : status == 'work'
      ? { status: { $in: ['created', 'working', 'waiting', 'work'] } }
      : { status: status }

  const user = await User.findById(userId)
  const carts: any = await Cart.find({ user })
    .sort({ createdAt: -1 })
    .skip((page - 1) * 50)
    .limit(50)

  const count = await Cart.count({ user })

  const format = await Promise.all(
    carts.map(async (cart: any) => {
      const date = new Date(cart.createdDate)
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0') // Месяцы в JavaScript начинаются с 0, поэтому прибавляем 1
      const year = date.getFullYear()
      const formattedDate = day + '.' + month + '.' + year

      if (cart.endedDate) {
        const endedDate = new Date(cart.endedDate)
        const day = endedDate.getDate().toString().padStart(2, '0')
        const month = (endedDate.getMonth() + 1).toString().padStart(2, '0') // Месяцы в JavaScript начинаются с 0, поэтому прибавляем 1
        const year = endedDate.getFullYear()
        const formattedEndedDate = day + '.' + month + '.' + year
        return {
          ...cart._doc,
          trueDate: formattedDate,
          trueEndedDate : formattedEndedDate,
        }
      }

      return {
        ...cart._doc,
        trueDate: formattedDate,
      }
    })
  )

  return { info: format, count }
}
