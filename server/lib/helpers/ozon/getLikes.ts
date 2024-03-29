import { User } from '~/server/lib/models/User'
import { Like } from '~/server/lib/models/ozon/Like'

export default async function getLikes(
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
  
  const likes: any = await Like.find({ user })
    .sort({ createdAt: -1 })
    .skip((page - 1) * 50)
    .limit(50)

  const count = await Like.count({ user })

  const format = await Promise.all(
    likes.map(async (like: any) => {
      const date = new Date(like.createdDate)
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0') // Месяцы в JavaScript начинаются с 0, поэтому прибавляем 1
      const year = date.getFullYear()
      const formattedDate = day + '.' + month + '.' + year

      if (like.endedDate) {
        const endedDate = new Date(like.endedDate)
        const day = endedDate.getDate().toString().padStart(2, '0')
        const month = (endedDate.getMonth() + 1).toString().padStart(2, '0') // Месяцы в JavaScript начинаются с 0, поэтому прибавляем 1
        const year = endedDate.getFullYear()
        const formattedEndedDate = day + '.' + month + '.' + year
        return {
          ...like._doc,
          trueDate: formattedDate,
          trueEndedDate: formattedEndedDate,
        }
      }

      return {
        ...like._doc,
        trueDate: formattedDate,
      }
    })
  )

  return { info: format, count }
}
