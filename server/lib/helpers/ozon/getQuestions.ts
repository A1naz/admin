import { Review } from '~/server/lib/models/ozon/Review'
import { User } from '~/server/lib/models/User'
import { Question } from '~/server/lib/models/ozon/Question'

export default async function getQuestions(
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
  const questions: any = await Question.find({ user })
    .sort({ createdAt: -1 })
    .skip((page - 1) * 50)
    .limit(50)

  const count = await Question.count({ user })

  const format = await Promise.all(
    questions.map(async (question: any) => {
      const date = new Date(question.createdDate)
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0') // Месяцы в JavaScript начинаются с 0, поэтому прибавляем 1
      const year = date.getFullYear()
      const formattedDate = day + '.' + month + '.' + year

      if (question.publishDate) {
        const publishDate = new Date(question.publishDate)
        const day = publishDate.getDate().toString().padStart(2, '0')
        const month = (publishDate.getMonth() + 1).toString().padStart(2, '0') // Месяцы в JavaScript начинаются с 0, поэтому прибавляем 1
        const year = publishDate.getFullYear()
        const formattedPublishDate = day + '.' + month + '.' + year
        return {
          ...question._doc,
          trueDate: formattedDate,
          trueEndedDate : formattedPublishDate,
        }
      }

      return {
        ...question._doc,
        trueDate: formattedDate,
      }
    })
  )

  return { info: format, count }
}
