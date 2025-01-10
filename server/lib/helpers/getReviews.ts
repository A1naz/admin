import { Review } from '../models/Review'
import { User } from '../models/User'
import { Delivery } from '../models/Delivery'

export default async function getReviews(
  userId: string,
  status: string,
  page: any,
  serviceId?: string,
) {
  let serviceIdFilter: any = {}
  let delivery: any = null
  let filter: any = {}

  if (serviceId) {
    const trueServiceId = serviceId.replaceAll('#', '')
    serviceIdFilter = { uuidbuyout: trueServiceId }
    delivery = await Delivery.findOne({ ...serviceIdFilter }).select('_id')

    if (!delivery) {
      return { info: [], count: 0 };
    }

    filter = { delivery: delivery._id }
  }

  const statusObj =
    status == 'any'
      ? {}
      : status == 'work'
      ? { status: { $in: ['created', 'working', 'waiting', 'work'] } }
      : { status: status }

  const user = await User.findById(userId)

  const query = filter ? { user, ...statusObj, ...filter } : { user, ...statusObj };
   
  const reviews: any = await Review.find(query)
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
