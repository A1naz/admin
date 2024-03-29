import { Review } from '~/server/lib/models/ozon/Review'
import { User } from '~/server/lib/models/User'
import { Delivery } from '~/server/lib/models/ozon/Delivery'

export default async function getReviews(
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
  const reviews: any = await Review.find({ user, ...statusObj })
    .sort({ createdAt: -1 })
    .skip((page - 1) * 50)
    .limit(50)

  const count = await Review.count({ user })

  const format = await Promise.all(
    reviews.map(async (review: any) => {
      const date = new Date(review.date)
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0') // Месяцы в JavaScript начинаются с 0, поэтому прибавляем 1
      const year = date.getFullYear()
      const formattedDate = day + '.' + month + '.' + year
      const delivery = await Delivery.findOne({ _id: review.delivery })
      if (!delivery) {

        return {
          ...review._doc,
          trueDate: formattedDate,
        }
      }
      return {
        ...review._doc,
        trueDate: formattedDate,
        uuidbuyout: delivery.uuidbuyout,
      }
    })
  )

  return { info: format, count }
}
