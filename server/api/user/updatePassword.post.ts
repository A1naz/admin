import bcrypt from 'bcrypt'
import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'

function hasWhiteSpace(s: string) {
  return s.includes(' ') || !/^[a-zA-Z0-9_-]{4,14}$/.test(s)
}
export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session)
    return sendRedirect(event, '/auth', 302)

  const body = await readBody(event)

  const { oldPassword, newPassword } = body

  const user = await User.findOne({ uuid: session.uuid })
  if (!user)
    return sendRedirect(event, '/auth', 302)

  if (hasWhiteSpace(newPassword)) {
    return {
      status: 'error',
      error:
        'Пароль не должен содержать пробелов, и состоять только из английских букв и цифр.',
    }
  }
  if (newPassword.length < 6 || newPassword.length > 14) {
    return {
      status: 'error',
      error: 'Пароль должен быть от 6 до 14 символов.',
    }
  }
  if (!user.password) {
    user.password = bcrypt.hashSync(newPassword, 7)
  }
  else {
    if (!bcrypt.compareSync(oldPassword, user.password)) {
      return {
        status: 'error',
        error: 'Неверный старый пароль.',
      }
    }
    user.password = bcrypt.hashSync(newPassword, 7)
  }

  await user.save()
  return {
    status: 'ok',
  }
})
