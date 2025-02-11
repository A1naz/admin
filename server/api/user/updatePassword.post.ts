import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'
import mailService from '@/server/lib/mailService'

function hasWhiteSpace(s: string) {
  return s.includes(' ') || !/^[a-zA-Z0-9_-]{6,16}$/.test(s)
}
export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  const runtimeConfig = useRuntimeConfig()

  if (!session)
    return sendRedirect(event, '/auth', 302)

  const body = await readBody(event)

  const { oldPassword, newPassword } = body

  const user = await User.findOne({ uuid: session.uuid })
  if (!user)
    return sendRedirect(event, '/auth', 302)

  if (newPassword.length < 6 || newPassword.length > 16) {
    return {
      status: 'error',
      error: 'Пароль должен быть от 6 до 16 символов.',
    }
  }
  if (hasWhiteSpace(newPassword)) {
    return {
      status: 'error',
      error:
        'Пароль не должен содержать пробелов, и состоять только из английских букв и цифр.',
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

  const token = jwt.sign(
    { email: user.email, id: user.id, password: newPassword },
    runtimeConfig.SECRET,
    {
      expiresIn: '10m',
    },
  )

  const url = `${runtimeConfig.PUBLIC_SITE_URL}/api/user/changePassword/${token}`

  await mailService.sendChangePasswordMail(
    user.email,
    url,
    user.firstName || user.username,
  )
  return {
    status: 'ok',
  }
})
