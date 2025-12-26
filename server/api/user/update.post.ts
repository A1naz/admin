import validator from 'validator'
import { User } from '@/server/lib/models/User'
import { getServerSession } from '#auth'

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any

  if (!session)
    return sendRedirect(event, '/auth', 302)

  const body = await readBody(event)

  const { email, username, firstName, lastName } = body

  if (!validator.isEmail(email)) {
    throw createError({
      statusCode: 400,
      message: 'Введите корректный email',
    })
  }

  if (!username || !/^[a-zA-Z0-9_-]{4,14}$/.test(username)) {
    throw createError({
      statusCode: 400,
      message: 'Имя пользователя должно быть длиной от 4 до 14 символов',
    })
  }
  const user = await User.findOne({ uuid: session.uuid })
  if (!user)
    return sendRedirect(event, '/auth', 302)

  const foundByUsername = await User.findOne({ username: body.username })
  if (foundByUsername && foundByUsername.uuid !== user.uuid) {
    throw createError({
      statusCode: 400,
      message: 'Не удалось обновить профиль. Проверьте введенные данные.',
    })
  }

  const foundByEmail = await User.findOne({ email: body.email })
  if (foundByEmail && foundByEmail.uuid !== user.uuid) {
    throw createError({
      statusCode: 400,
      message: 'Не удалось обновить профиль. Проверьте введенные данные.',
    })
  }
  user.username = username
  user.email = email
  user.firstName = firstName
  user.lastName = lastName
  await user.save()
  return {
    status: 'ok',
  }
})
