import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import { Question } from '~~/server/lib/models/Question'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session)
    return sendRedirect(event, '/auth', 302)

  const user = await User.findOne({ uuid: session.uuid })
  if (!user)
    return sendRedirect(event, '/auth', 302)
  const questions = await Question.find({ user }).sort({ _id: -1 })
  const format = questions.map((question, index) => {
    return {
      place: index + 1,
      status: question.status,
      article: question.article,
      image: question.image,
      gender: question.gender,
      createdDate: question.createdDate,
      text: question.text,
      publishDate: question.publishDate,
    }
  })
  return format
})
